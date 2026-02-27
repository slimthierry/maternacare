"""Webhook service for SIH integration alerts."""

import hashlib
import hmac
import json
import logging
from datetime import datetime, timezone

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)

# Webhook event types
WEBHOOK_EVENTS = {
    "pre_eclampsia_risk": "Pre-eclampsia risk detected",
    "gestational_diabetes": "Gestational diabetes detected",
    "abnormal_ultrasound": "Abnormal ultrasound findings",
    "delivery_imminent": "Delivery imminent",
    "low_apgar": "Low APGAR score detected",
    "postpartum_depression": "Postpartum depression risk detected",
}


def _sign_payload(payload: str, secret: str) -> str:
    """Generate HMAC-SHA256 signature for webhook payload."""
    return hmac.new(
        secret.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


async def send_webhook(
    event_type: str,
    data: dict,
    patient_ipp: str | None = None,
) -> bool:
    """Send a webhook notification to the configured SIH endpoint."""
    if not settings.WEBHOOK_URL:
        logger.debug("No webhook URL configured, skipping webhook for %s", event_type)
        return False

    payload = {
        "event": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "maternacare",
        "data": data,
    }

    if patient_ipp:
        payload["patient_ipp"] = patient_ipp

    payload_json = json.dumps(payload, default=str)

    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event_type,
        "X-Webhook-Source": "maternacare",
    }

    if settings.WEBHOOK_SECRET:
        signature = _sign_payload(payload_json, settings.WEBHOOK_SECRET)
        headers["X-Webhook-Signature"] = f"sha256={signature}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                settings.WEBHOOK_URL,
                content=payload_json,
                headers=headers,
            )
            response.raise_for_status()
            logger.info("Webhook sent successfully: %s", event_type)
            return True
    except httpx.HTTPError as e:
        logger.error("Webhook delivery failed for %s: %s", event_type, str(e))
        return False
