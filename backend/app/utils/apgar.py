"""APGAR score calculation and assessment utilities.

APGAR scoring system (0-2 for each criterion, total 0-10):
- Appearance (skin color)
- Pulse (heart rate)
- Grimace (reflex irritability)
- Activity (muscle tone)
- Respiration (breathing effort)
"""

from dataclasses import dataclass


@dataclass
class APGARComponent:
    """Individual APGAR component score."""

    name: str
    score: int  # 0, 1, or 2
    description: str


@dataclass
class APGARAssessment:
    """Complete APGAR assessment result."""

    total_score: int
    classification: str
    components: list[APGARComponent]
    needs_intervention: bool


# APGAR score descriptions for each component
APGAR_CRITERIA = {
    "appearance": {
        0: "Blue or pale all over (cyanose generalisee)",
        1: "Blue extremities, pink body (acrocyanose)",
        2: "Completely pink (coloration rose)",
    },
    "pulse": {
        0: "Absent (absent)",
        1: "Below 100 bpm (< 100 bpm)",
        2: "100 bpm or above (>= 100 bpm)",
    },
    "grimace": {
        0: "No response (aucune reponse)",
        1: "Grimace on stimulation (grimace)",
        2: "Cry on stimulation (cri vigoureux)",
    },
    "activity": {
        0: "Limp (hypotonie)",
        1: "Some flexion (flexion legere)",
        2: "Active movement (mouvements actifs)",
    },
    "respiration": {
        0: "Absent (absente)",
        1: "Weak, irregular (faible, irreguliere)",
        2: "Strong cry (cri vigoureux)",
    },
}


def calculate_apgar(
    appearance: int,
    pulse: int,
    grimace: int,
    activity: int,
    respiration: int,
) -> APGARAssessment:
    """Calculate APGAR score from individual components.

    Each component should be scored 0-2.
    Total score interpretation:
    - 7-10: Normal (reassuring)
    - 4-6: Moderately abnormal (some intervention needed)
    - 0-3: Low (immediate resuscitation needed)
    """
    components = []
    for name, score in [
        ("appearance", appearance),
        ("pulse", pulse),
        ("grimace", grimace),
        ("activity", activity),
        ("respiration", respiration),
    ]:
        if score not in (0, 1, 2):
            raise ValueError(f"APGAR component {name} must be 0, 1, or 2; got {score}")
        components.append(
            APGARComponent(
                name=name,
                score=score,
                description=APGAR_CRITERIA[name][score],
            )
        )

    total_score = sum(c.score for c in components)

    if total_score >= 7:
        classification = "normal"
    elif total_score >= 4:
        classification = "moderately_abnormal"
    else:
        classification = "critically_low"

    needs_intervention = total_score < 7

    return APGARAssessment(
        total_score=total_score,
        classification=classification,
        components=components,
        needs_intervention=needs_intervention,
    )


def classify_apgar_score(score: int) -> str:
    """Classify a total APGAR score.

    Returns: 'normal', 'moderately_abnormal', or 'critically_low'
    """
    if score >= 7:
        return "normal"
    elif score >= 4:
        return "moderately_abnormal"
    else:
        return "critically_low"


def apgar_needs_alert(score: int) -> bool:
    """Determine if an APGAR score requires an alert."""
    return score < 7


def format_apgar_summary(
    apgar_1min: int | None,
    apgar_5min: int | None,
    apgar_10min: int | None,
) -> str:
    """Format APGAR scores as a summary string."""
    parts = []
    if apgar_1min is not None:
        parts.append(f"1min: {apgar_1min}/10")
    if apgar_5min is not None:
        parts.append(f"5min: {apgar_5min}/10")
    if apgar_10min is not None:
        parts.append(f"10min: {apgar_10min}/10")

    if not parts:
        return "APGAR: non evalue"

    return f"APGAR: {', '.join(parts)}"
