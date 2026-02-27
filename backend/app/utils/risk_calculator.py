"""Risk assessment calculator for obstetric complications.

Implements clinical thresholds for automatic risk detection:
- Pre-eclampsia: BP > 140/90 mmHg + proteinuria > 1+
- Gestational diabetes: fasting glycemia > 0.92 g/L
- IUGR: fetal weight < 10th percentile for gestational age
- Preterm labor: < 37 weeks with severe edema or other risk factors
"""

# 10th percentile fetal weight by gestational week (grams)
# Source: Hadlock et al. / INTERGROWTH-21st reference tables
FETAL_WEIGHT_10TH_PERCENTILE: dict[int, int] = {
    20: 249,
    21: 290,
    22: 336,
    23: 385,
    24: 440,
    25: 500,
    26: 567,
    27: 640,
    28: 720,
    29: 810,
    30: 908,
    31: 1015,
    32: 1130,
    33: 1252,
    34: 1380,
    35: 1513,
    36: 1650,
    37: 1790,
    38: 1930,
    39: 2065,
    40: 2190,
    41: 2300,
    42: 2390,
}

# Proteinuria severity levels
PROTEINURIA_LEVELS = {
    "negative": 0,
    "trace": 0.5,
    "1+": 1,
    "2+": 2,
    "3+": 3,
    "4+": 4,
}


def check_pre_eclampsia_risk(
    systolic: int | None,
    diastolic: int | None,
    proteinuria: str | None,
) -> bool:
    """Check for pre-eclampsia risk.

    Pre-eclampsia criteria: BP >= 140/90 mmHg AND proteinuria >= 1+
    """
    if systolic is None or diastolic is None or proteinuria is None:
        return False

    bp_elevated = systolic >= 140 or diastolic >= 90
    proteinuria_level = PROTEINURIA_LEVELS.get(proteinuria, 0)
    proteinuria_positive = proteinuria_level >= 1

    return bp_elevated and proteinuria_positive


def check_gestational_diabetes_risk(
    glycemia: float | None,
) -> bool:
    """Check for gestational diabetes risk.

    Threshold: fasting glycemia > 0.92 g/L
    """
    if glycemia is None:
        return False
    return glycemia > 0.92


def check_iugr_risk(
    fetal_weight_g: int | None,
    gestational_week: int | None,
) -> bool:
    """Check for Intrauterine Growth Restriction (IUGR) risk.

    IUGR: fetal weight below the 10th percentile for gestational age.
    """
    if fetal_weight_g is None or gestational_week is None:
        return False

    threshold = FETAL_WEIGHT_10TH_PERCENTILE.get(gestational_week)
    if threshold is None:
        # Interpolate for missing weeks
        lower_week = max(w for w in FETAL_WEIGHT_10TH_PERCENTILE if w <= gestational_week)
        upper_week = min(w for w in FETAL_WEIGHT_10TH_PERCENTILE if w >= gestational_week)
        if lower_week == upper_week:
            threshold = FETAL_WEIGHT_10TH_PERCENTILE[lower_week]
        else:
            lower_weight = FETAL_WEIGHT_10TH_PERCENTILE[lower_week]
            upper_weight = FETAL_WEIGHT_10TH_PERCENTILE[upper_week]
            fraction = (gestational_week - lower_week) / (upper_week - lower_week)
            threshold = int(lower_weight + fraction * (upper_weight - lower_weight))

    return fetal_weight_g < threshold


def check_preterm_labor_risk(
    gestational_week: int | None,
    edema: str | None = None,
    contractions: bool = False,
) -> bool:
    """Check for preterm labor risk.

    Risk: < 37 weeks with contractions or severe edema.
    """
    if gestational_week is None:
        return False

    if gestational_week >= 37:
        return False

    if contractions:
        return True

    if edema == "severe":
        return True

    return False


def calculate_overall_risk_level(
    pre_eclampsia: bool = False,
    gestational_diabetes: bool = False,
    iugr: bool = False,
    preterm_labor: bool = False,
    previous_complications: list[str] | None = None,
) -> str:
    """Calculate overall pregnancy risk level.

    Returns: 'low', 'medium', 'high', or 'very_high'
    """
    risk_score = 0

    if pre_eclampsia:
        risk_score += 3
    if gestational_diabetes:
        risk_score += 2
    if iugr:
        risk_score += 3
    if preterm_labor:
        risk_score += 3

    if previous_complications:
        risk_score += len(previous_complications)

    if risk_score == 0:
        return "low"
    elif risk_score <= 2:
        return "medium"
    elif risk_score <= 4:
        return "high"
    else:
        return "very_high"
