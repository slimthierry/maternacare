"""Background tasks for alert processing and webhook delivery."""

import asyncio
import logging

from app.services.webhook_service import send_webhook

logger = logging.getLogger(__name__)


async def process_alert_webhook(
    alert_type: str,
    alert_data: dict,
    patient_ipp: str | None = None,
) -> None:
    """Process an alert and send webhook notification."""
    logger.info("Processing alert webhook: %s", alert_type)
    await send_webhook(
        event_type=alert_type,
        data=alert_data,
        patient_ipp=patient_ipp,
    )


async def check_upcoming_deliveries() -> None:
    """Check for pregnancies near due date and send alerts."""
    # This would be run as a scheduled task
    logger.info("Checking for upcoming deliveries...")
    # Implementation would query pregnancies where estimated_due_date
    # is within 2 weeks and send delivery_imminent webhooks


async def check_overdue_appointments() -> None:
    """Check for overdue prenatal appointments."""
    logger.info("Checking for overdue appointments...")
    # Implementation would query consultations where next_appointment
    # has passed without a follow-up
