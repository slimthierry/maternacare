"""Background tasks for appointment management."""

import asyncio
import logging
from datetime import date, timedelta

from sqlalchemy import select

from app.celery_app import celery_app
from app.config.database import async_session_factory
from app.models.consultation_models import Consultation
from app.models.pregnancy_models import Pregnancy

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.tasks.appointment_tasks.send_appointment_reminders")
def send_appointment_reminders() -> int:
    """Send reminders for appointments scheduled within the next 48 hours."""
    logger.info("Sending appointment reminders...")
    return _run_async(_send_appointment_reminders_async())


async def _send_appointment_reminders_async() -> int:
    """Async implementation for sending appointment reminders."""
    reminders_sent = 0
    async with async_session_factory() as db:
        today = date.today()
        in_48h = today + timedelta(days=2)

        result = await db.execute(
            select(Consultation)
            .where(Consultation.next_appointment.isnot(None))
            .where(Consultation.next_appointment >= today)
            .where(Consultation.next_appointment <= in_48h)
        )
        upcoming = result.scalars().all()

        for consultation in upcoming:
            pregnancy_result = await db.execute(
                select(Pregnancy).where(Pregnancy.id == consultation.pregnancy_id)
            )
            pregnancy = pregnancy_result.scalar_one_or_none()
            if pregnancy is None or pregnancy.status != "active":
                continue

            logger.info(
                "Reminder: appointment for pregnancy %d on %s",
                consultation.pregnancy_id,
                consultation.next_appointment,
            )
            reminders_sent += 1

    logger.info("Sent %d appointment reminders", reminders_sent)
    return reminders_sent


async def generate_appointment_schedule(
    lmp_date: date,
) -> list[dict]:
    """Generate a recommended prenatal appointment schedule based on LMP date.

    Standard French prenatal visit schedule:
    - Monthly visits from month 4 to month 7
    - Biweekly visits from month 8
    - Weekly visits from week 37
    """
    schedule = []

    # Monthly visits: weeks 16, 20, 24, 28
    for week in [16, 20, 24, 28]:
        visit_date = lmp_date + timedelta(weeks=week)
        schedule.append({
            "gestational_week": week,
            "date": visit_date,
            "type": "routine",
            "description": f"Consultation prenatale - Semaine {week}",
        })

    # Key ultrasounds
    ultrasound_weeks = [
        (12, "dating", "Echographie de datation (T1)"),
        (22, "morphology", "Echographie morphologique (T2)"),
        (32, "growth", "Echographie de croissance (T3)"),
    ]
    for week, us_type, desc in ultrasound_weeks:
        visit_date = lmp_date + timedelta(weeks=week)
        schedule.append({
            "gestational_week": week,
            "date": visit_date,
            "type": us_type,
            "description": desc,
        })

    # Biweekly from week 32
    for week in range(32, 37, 2):
        visit_date = lmp_date + timedelta(weeks=week)
        schedule.append({
            "gestational_week": week,
            "date": visit_date,
            "type": "routine",
            "description": f"Suivi rapproche - Semaine {week}",
        })

    # Weekly from week 37
    for week in range(37, 41):
        visit_date = lmp_date + timedelta(weeks=week)
        schedule.append({
            "gestational_week": week,
            "date": visit_date,
            "type": "routine",
            "description": f"Suivi hebdomadaire - Semaine {week}",
        })

    return sorted(schedule, key=lambda x: x["gestational_week"])
