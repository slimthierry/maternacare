"""Fetal growth chart reference data and percentile calculations.

Based on INTERGROWTH-21st and Hadlock reference standards.
"""

# Biparietal Diameter (BPD) reference in mm by gestational week
# Format: {week: (3rd, 10th, 50th, 90th, 97th percentile)}
BPD_REFERENCE: dict[int, tuple[float, ...]] = {
    14: (25, 27, 29, 31, 33),
    16: (31, 33, 36, 39, 41),
    18: (37, 39, 43, 47, 49),
    20: (43, 46, 50, 54, 56),
    22: (49, 52, 56, 60, 63),
    24: (55, 58, 62, 66, 69),
    26: (60, 63, 68, 73, 76),
    28: (65, 69, 74, 79, 82),
    30: (71, 74, 79, 84, 87),
    32: (75, 79, 84, 89, 92),
    34: (79, 83, 88, 93, 96),
    36: (83, 86, 91, 96, 99),
    38: (85, 89, 94, 99, 102),
    40: (87, 91, 96, 101, 104),
}

# Femur Length (FL) reference in mm by gestational week
FL_REFERENCE: dict[int, tuple[float, ...]] = {
    14: (11, 13, 15, 17, 19),
    16: (17, 19, 21, 23, 25),
    18: (23, 25, 27, 29, 31),
    20: (29, 31, 33, 35, 37),
    22: (35, 37, 39, 41, 43),
    24: (40, 42, 44, 46, 48),
    26: (44, 46, 49, 52, 54),
    28: (48, 50, 53, 56, 58),
    30: (52, 54, 57, 60, 62),
    32: (55, 58, 61, 64, 66),
    34: (58, 61, 64, 67, 69),
    36: (62, 64, 67, 70, 72),
    38: (64, 67, 70, 73, 75),
    40: (66, 69, 72, 75, 77),
}

# Estimated Fetal Weight (EFW) reference in grams by gestational week
EFW_REFERENCE: dict[int, tuple[int, ...]] = {
    20: (215, 249, 313, 394, 455),
    22: (330, 382, 480, 604, 698),
    24: (475, 540, 665, 820, 940),
    26: (640, 730, 900, 1110, 1270),
    28: (830, 950, 1180, 1460, 1680),
    30: (1060, 1210, 1510, 1880, 2160),
    32: (1330, 1520, 1900, 2370, 2720),
    34: (1620, 1860, 2320, 2890, 3310),
    36: (1920, 2210, 2750, 3420, 3920),
    38: (2200, 2530, 3150, 3920, 4490),
    40: (2430, 2790, 3460, 4300, 4920),
}


def get_percentile(
    value: float,
    reference: tuple[float, ...],
) -> str:
    """Determine the percentile range for a measurement.

    Reference tuple is (3rd, 10th, 50th, 90th, 97th).
    """
    p3, p10, p50, p90, p97 = reference

    if value < p3:
        return "<3rd"
    elif value < p10:
        return "3rd-10th"
    elif value < p50:
        return "10th-50th"
    elif value < p90:
        return "50th-90th"
    elif value < p97:
        return "90th-97th"
    else:
        return ">97th"


def assess_fetal_growth(
    gestational_week: int,
    bpd_mm: float | None = None,
    fl_mm: float | None = None,
    efw_g: int | None = None,
) -> dict:
    """Assess fetal growth against reference charts.

    Returns a dict with percentile assessments for each measurement.
    """
    assessment = {"gestational_week": gestational_week}

    if bpd_mm is not None and gestational_week in BPD_REFERENCE:
        assessment["bpd"] = {
            "value": bpd_mm,
            "unit": "mm",
            "percentile": get_percentile(bpd_mm, BPD_REFERENCE[gestational_week]),
        }

    if fl_mm is not None and gestational_week in FL_REFERENCE:
        assessment["femur_length"] = {
            "value": fl_mm,
            "unit": "mm",
            "percentile": get_percentile(fl_mm, FL_REFERENCE[gestational_week]),
        }

    if efw_g is not None and gestational_week in EFW_REFERENCE:
        assessment["estimated_weight"] = {
            "value": efw_g,
            "unit": "g",
            "percentile": get_percentile(
                float(efw_g),
                tuple(float(x) for x in EFW_REFERENCE[gestational_week]),
            ),
        }

    return assessment
