"""Pregnancy date calculation utilities.

Based on Naegele's rule and standard obstetric calculations.
"""

from datetime import date, timedelta


def calculate_due_date(lmp_date: date) -> date:
    """Calculate estimated due date from Last Menstrual Period (LMP).

    Uses Naegele's rule: LMP + 280 days (40 weeks).
    """
    return lmp_date + timedelta(days=280)


def calculate_gestational_age(lmp_date: date, reference_date: date | None = None) -> dict:
    """Calculate gestational age in weeks and days.

    Returns dict with 'weeks', 'days', and 'total_days'.
    """
    if reference_date is None:
        reference_date = date.today()

    total_days = (reference_date - lmp_date).days
    weeks = total_days // 7
    days = total_days % 7

    return {
        "weeks": weeks,
        "days": days,
        "total_days": total_days,
    }


def calculate_trimester(gestational_weeks: int) -> int:
    """Determine the trimester based on gestational weeks.

    T1: weeks 1-13
    T2: weeks 14-27
    T3: weeks 28-42
    """
    if gestational_weeks <= 13:
        return 1
    elif gestational_weeks <= 27:
        return 2
    else:
        return 3


def calculate_lmp_from_due_date(due_date: date) -> date:
    """Calculate LMP from estimated due date (reverse Naegele's)."""
    return due_date - timedelta(days=280)


def is_term(gestational_weeks: int) -> bool:
    """Check if the pregnancy is at term (37-42 weeks)."""
    return 37 <= gestational_weeks <= 42


def is_preterm(gestational_weeks: int) -> bool:
    """Check if the pregnancy is preterm (< 37 weeks)."""
    return gestational_weeks < 37


def is_post_term(gestational_weeks: int) -> bool:
    """Check if the pregnancy is post-term (> 42 weeks)."""
    return gestational_weeks > 42


def get_milestone_description(gestational_weeks: int) -> str:
    """Get a description of the pregnancy milestone for the given week."""
    milestones = {
        8: "Premiere echographie recommandee",
        11: "Depistage prenatal T1 (tri-test)",
        12: "Echographie de datation (T1)",
        16: "Debut des mouvements foetaux perceptibles",
        20: "Mi-grossesse",
        22: "Echographie morphologique (T2)",
        24: "Test de glucose (HGPO) si facteurs de risque",
        28: "Injection anti-D si Rh negatif",
        32: "Echographie de croissance (T3)",
        34: "Preparation a l'accouchement",
        37: "Grossesse a terme",
        40: "Date prevue d'accouchement (DPA)",
        41: "Surveillance renforcee post-terme",
    }

    return milestones.get(gestational_weeks, f"Semaine {gestational_weeks}")


def get_recommended_visits(lmp_date: date) -> list[dict]:
    """Generate the recommended prenatal visit schedule.

    Based on French HAS (Haute Autorite de Sante) guidelines.
    """
    visits = []

    # 7 mandatory prenatal consultations
    consultation_weeks = [12, 16, 20, 24, 28, 32, 36]
    for i, week in enumerate(consultation_weeks, 1):
        visit_date = lmp_date + timedelta(weeks=week)
        visits.append({
            "week": week,
            "date": visit_date,
            "type": "consultation",
            "label": f"Consultation prenatale n{i}",
            "trimester": calculate_trimester(week),
        })

    # 3 mandatory ultrasounds
    ultrasound_schedule = [
        (12, "Echographie T1 - Datation"),
        (22, "Echographie T2 - Morphologie"),
        (32, "Echographie T3 - Croissance"),
    ]
    for week, label in ultrasound_schedule:
        visit_date = lmp_date + timedelta(weeks=week)
        visits.append({
            "week": week,
            "date": visit_date,
            "type": "ultrasound",
            "label": label,
            "trimester": calculate_trimester(week),
        })

    return sorted(visits, key=lambda v: v["week"])
