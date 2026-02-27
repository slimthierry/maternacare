"""Tests for alert management and risk assessment."""

import pytest

from app.utils.risk_calculator import (
    calculate_overall_risk_level,
    check_gestational_diabetes_risk,
    check_iugr_risk,
    check_pre_eclampsia_risk,
    check_preterm_labor_risk,
)
from app.utils.apgar import calculate_apgar, classify_apgar_score, apgar_needs_alert


class TestRiskCalculator:
    """Test risk calculator functions."""

    def test_pre_eclampsia_positive(self):
        """Test pre-eclampsia detection with high BP and proteinuria."""
        assert check_pre_eclampsia_risk(
            systolic=150, diastolic=95, proteinuria="2+"
        ) is True

    def test_pre_eclampsia_negative_normal_bp(self):
        """Test no pre-eclampsia with normal BP."""
        assert check_pre_eclampsia_risk(
            systolic=120, diastolic=80, proteinuria="2+"
        ) is False

    def test_pre_eclampsia_negative_no_proteinuria(self):
        """Test no pre-eclampsia without proteinuria."""
        assert check_pre_eclampsia_risk(
            systolic=150, diastolic=95, proteinuria="negative"
        ) is False

    def test_pre_eclampsia_none_values(self):
        """Test pre-eclampsia check with None values."""
        assert check_pre_eclampsia_risk(
            systolic=None, diastolic=None, proteinuria=None
        ) is False

    def test_gestational_diabetes_positive(self):
        """Test gestational diabetes detection."""
        assert check_gestational_diabetes_risk(glycemia=1.05) is True

    def test_gestational_diabetes_negative(self):
        """Test no gestational diabetes with normal glycemia."""
        assert check_gestational_diabetes_risk(glycemia=0.85) is False

    def test_gestational_diabetes_none(self):
        """Test gestational diabetes check with None."""
        assert check_gestational_diabetes_risk(glycemia=None) is False

    def test_iugr_positive(self):
        """Test IUGR detection with low fetal weight."""
        assert check_iugr_risk(fetal_weight_g=500, gestational_week=28) is True

    def test_iugr_negative(self):
        """Test no IUGR with normal fetal weight."""
        assert check_iugr_risk(fetal_weight_g=1200, gestational_week=28) is False

    def test_iugr_none(self):
        """Test IUGR check with None values."""
        assert check_iugr_risk(fetal_weight_g=None, gestational_week=None) is False

    def test_preterm_labor_risk_with_edema(self):
        """Test preterm labor risk detection with severe edema."""
        assert check_preterm_labor_risk(
            gestational_week=34, edema="severe"
        ) is True

    def test_preterm_labor_no_risk_at_term(self):
        """Test no preterm labor risk at term."""
        assert check_preterm_labor_risk(
            gestational_week=38, edema="severe"
        ) is False

    def test_overall_risk_low(self):
        """Test overall risk calculation - low."""
        assert calculate_overall_risk_level() == "low"

    def test_overall_risk_high(self):
        """Test overall risk calculation - high."""
        assert calculate_overall_risk_level(
            pre_eclampsia=True
        ) == "high"

    def test_overall_risk_very_high(self):
        """Test overall risk calculation - very high."""
        assert calculate_overall_risk_level(
            pre_eclampsia=True, iugr=True
        ) == "very_high"


class TestAPGAR:
    """Test APGAR score utilities."""

    def test_normal_apgar(self):
        """Test normal APGAR score calculation."""
        result = calculate_apgar(
            appearance=2, pulse=2, grimace=2, activity=2, respiration=2
        )
        assert result.total_score == 10
        assert result.classification == "normal"
        assert result.needs_intervention is False

    def test_moderate_apgar(self):
        """Test moderately abnormal APGAR score."""
        result = calculate_apgar(
            appearance=1, pulse=1, grimace=1, activity=1, respiration=1
        )
        assert result.total_score == 5
        assert result.classification == "moderately_abnormal"
        assert result.needs_intervention is True

    def test_critical_apgar(self):
        """Test critically low APGAR score."""
        result = calculate_apgar(
            appearance=0, pulse=1, grimace=0, activity=0, respiration=1
        )
        assert result.total_score == 2
        assert result.classification == "critically_low"
        assert result.needs_intervention is True

    def test_classify_apgar(self):
        """Test APGAR score classification."""
        assert classify_apgar_score(9) == "normal"
        assert classify_apgar_score(5) == "moderately_abnormal"
        assert classify_apgar_score(2) == "critically_low"

    def test_apgar_alert_threshold(self):
        """Test APGAR alert threshold."""
        assert apgar_needs_alert(6) is True
        assert apgar_needs_alert(7) is False
        assert apgar_needs_alert(3) is True

    def test_invalid_apgar_component(self):
        """Test APGAR with invalid component score."""
        with pytest.raises(ValueError):
            calculate_apgar(
                appearance=3, pulse=2, grimace=2, activity=2, respiration=2
            )
