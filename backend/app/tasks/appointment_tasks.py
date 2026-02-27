"""Background tasks for appointment management."""

import logging
from datetime import date, timedelta

logger = logging.getLogger(__name__)


async def send_appointment_reminders() -> None:
    """Send reminders for appointments scheduled within the next 48 hours."""
    logger.info("Sending appointment reminders...")
    # Implementation would query consultations with next_appointment
    # within 48 hours and trigger notification


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
    due_date = lmp_date + timedelta(weeks=40)

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
