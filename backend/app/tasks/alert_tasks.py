"""Background tasks for alert processing and webhook delivery."""

import asyncio
import logging
from datetime import date, timedelta

from sqlalchemy import select

from app.celery_app import celery_app
from app.config.database import async_session_factory
from app.models.alert_models import Alert
from app.models.pregnancy_models import Pregnancy
from app.services.webhook_service import send_webhook

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(
    name="app.tasks.alert_tasks.process_alert_webhook",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def process_alert_webhook(
    self,
    alert_type: str,
    alert_data: dict,
    patient_ipp: str | None = None,
) -> bool:
    """Process an alert and send webhook notification."""
    logger.info("Processing alert webhook: %s", alert_type)
    try:
        return _run_async(
            send_webhook(
                event_type=alert_type,
                data=alert_data,
                patient_ipp=patient_ipp,
            )
        )
    except Exception as exc:
        logger.error("Webhook failed for %s (attempt %d): %s", alert_type, self.request.retries + 1, exc)
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.alert_tasks.check_upcoming_deliveries",
    bind=True,
    max_retries=2,
    default_retry_delay=300,
)
def check_upcoming_deliveries(self) -> int:
    """Check for pregnancies near due date and create delivery_imminent alerts."""
    logger.info("Checking for upcoming deliveries...")
    try:
        return _run_async(_check_upcoming_deliveries_async())
    except Exception as exc:
        logger.error("check_upcoming_deliveries failed (attempt %d): %s", self.request.retries + 1, exc)
        raise self.retry(exc=exc)


async def _check_upcoming_deliveries_async() -> int:
    """Async implementation for checking upcoming deliveries."""
    alerts_created = 0
    async with async_session_factory() as db:
        today = date.today()
        two_weeks = today + timedelta(weeks=2)

        result = await db.execute(
            select(Pregnancy)
            .where(Pregnancy.status == "active")
            .where(Pregnancy.estimated_due_date <= two_weeks)
            .where(Pregnancy.estimated_due_date >= today)
        )
        pregnancies = result.scalars().all()

        for pregnancy in pregnancies:
            existing = await db.execute(
                select(Alert)
                .where(Alert.pregnancy_id == pregnancy.id)
                .where(Alert.type == "delivery_imminent")
                .where(Alert.status.in_(["active", "acknowledged"]))
            )
            if existing.scalar_one_or_none() is None:
                days_until = (pregnancy.estimated_due_date - today).days
                alert = Alert(
                    pregnancy_id=pregnancy.id,
                    type="delivery_imminent",
                    severity="warning" if days_until > 7 else "critical",
                    description=f"Accouchement prevu dans {days_until} jours (DPA: {pregnancy.estimated_due_date})",
                    auto_generated=True,
                )
                db.add(alert)
                alerts_created += 1

                await send_webhook(
                    event_type="delivery_imminent",
                    data={"pregnancy_id": pregnancy.id, "days_until_due": days_until},
                )

        await db.commit()

    logger.info("Created %d delivery imminent alerts", alerts_created)
    return alerts_created


@celery_app.task(
    name="app.tasks.alert_tasks.check_overdue_appointments",
    bind=True,
    max_retries=2,
    default_retry_delay=300,
)
def check_overdue_appointments(self) -> int:
    """Check for overdue prenatal appointments and create alerts."""
    logger.info("Checking for overdue appointments...")
    try:
        return _run_async(_check_overdue_appointments_async())
    except Exception as exc:
        logger.error("check_overdue_appointments failed (attempt %d): %s", self.request.retries + 1, exc)
        raise self.retry(exc=exc)


async def _check_overdue_appointments_async() -> int:
    """Async implementation for checking overdue appointments."""
    from app.models.consultation_models import Consultation

    alerts_created = 0
    async with async_session_factory() as db:
        today = date.today()
        overdue_threshold = today - timedelta(days=7)

        result = await db.execute(
            select(Consultation)
            .where(Consultation.next_appointment.isnot(None))
            .where(Consultation.next_appointment < overdue_threshold)
        )
        overdue_consultations = result.scalars().all()

        checked_pregnancies = set()
        for consultation in overdue_consultations:
            if consultation.pregnancy_id in checked_pregnancies:
                continue
            checked_pregnancies.add(consultation.pregnancy_id)

            pregnancy_result = await db.execute(
                select(Pregnancy).where(Pregnancy.id == consultation.pregnancy_id)
            )
            pregnancy = pregnancy_result.scalar_one_or_none()
            if pregnancy is None or pregnancy.status != "active":
                continue

            existing = await db.execute(
                select(Alert)
                .where(Alert.pregnancy_id == consultation.pregnancy_id)
                .where(Alert.type == "overdue_appointment")
                .where(Alert.status.in_(["active", "acknowledged"]))
            )
            if existing.scalar_one_or_none() is None:
                days_overdue = (today - consultation.next_appointment).days
                alert = Alert(
                    pregnancy_id=consultation.pregnancy_id,
                    type="overdue_appointment",
                    severity="warning",
                    description=f"Rendez-vous prenatal en retard de {days_overdue} jours (prevu le {consultation.next_appointment})",
                    auto_generated=True,
                )
                db.add(alert)
                alerts_created += 1

        await db.commit()

    logger.info("Created %d overdue appointment alerts", alerts_created)
    return alerts_created
