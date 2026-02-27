"""Risk assessment service that auto-generates alerts based on clinical data."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert_models import Alert
from app.models.consultation_models import Consultation
from app.models.pregnancy_models import Pregnancy
from app.models.ultrasound_models import Ultrasound
from app.utils.risk_calculator import (
    check_gestational_diabetes_risk,
    check_iugr_risk,
    check_pre_eclampsia_risk,
    check_preterm_labor_risk,
)


async def assess_consultation_risk(
    db: AsyncSession, consultation: Consultation
) -> list[Alert]:
    """Assess risks after a consultation and generate alerts."""
    alerts_created = []

    # Pre-eclampsia risk: BP > 140/90 + proteinuria > 1+
    if check_pre_eclampsia_risk(
        systolic=consultation.blood_pressure_systolic,
        diastolic=consultation.blood_pressure_diastolic,
        proteinuria=consultation.proteinuria,
    ):
        alert = Alert(
            pregnancy_id=consultation.pregnancy_id,
            type="pre_eclampsia",
            severity="critical",
            description=(
                f"Pre-eclampsia risk detected: BP {consultation.blood_pressure_systolic}/"
                f"{consultation.blood_pressure_diastolic} mmHg with proteinuria "
                f"{consultation.proteinuria}. Immediate evaluation required."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

        # Update pregnancy risk level
        pregnancy = await db.get(Pregnancy, consultation.pregnancy_id)
        if pregnancy and pregnancy.risk_level in ("low", "medium"):
            pregnancy.risk_level = "high"

    # Gestational diabetes risk: glycemia > 0.92 g/L fasting
    if check_gestational_diabetes_risk(glycemia=consultation.glycemia):
        alert = Alert(
            pregnancy_id=consultation.pregnancy_id,
            type="gestational_diabetes",
            severity="warning",
            description=(
                f"Gestational diabetes risk: fasting glycemia {consultation.glycemia} g/L "
                f"(threshold: 0.92 g/L). OGTT recommended."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

    # Preterm labor risk: < 37 weeks with concerning signs
    if check_preterm_labor_risk(
        gestational_week=consultation.gestational_week,
        edema=consultation.edema,
    ):
        alert = Alert(
            pregnancy_id=consultation.pregnancy_id,
            type="preterm_labor",
            severity="warning",
            description=(
                f"Preterm labor risk at week {consultation.gestational_week}: "
                f"severe edema detected. Monitoring recommended."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

    if alerts_created:
        await db.flush()

    return alerts_created


async def assess_ultrasound_risk(
    db: AsyncSession, ultrasound: Ultrasound
) -> list[Alert]:
    """Assess risks after an ultrasound and generate alerts."""
    alerts_created = []

    # IUGR risk: fetal weight < 10th percentile
    if check_iugr_risk(
        fetal_weight_g=ultrasound.fetal_weight_g,
        gestational_week=ultrasound.gestational_week,
    ):
        alert = Alert(
            pregnancy_id=ultrasound.pregnancy_id,
            type="iugr",
            severity="warning",
            description=(
                f"IUGR risk: fetal weight {ultrasound.fetal_weight_g}g at week "
                f"{ultrasound.gestational_week} is below the 10th percentile. "
                f"Growth monitoring recommended."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

        # Update pregnancy risk level
        pregnancy = await db.get(Pregnancy, ultrasound.pregnancy_id)
        if pregnancy and pregnancy.risk_level in ("low", "medium"):
            pregnancy.risk_level = "high"

    # Anomalies detected
    if ultrasound.anomalies_detected:
        alert = Alert(
            pregnancy_id=ultrasound.pregnancy_id,
            type="anomaly",
            severity="warning",
            description=(
                f"Ultrasound anomalies detected at week {ultrasound.gestational_week}: "
                f"{', '.join(ultrasound.anomalies_detected)}. "
                f"Specialist consultation recommended."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

    # Low amniotic fluid
    if ultrasound.amniotic_fluid_index is not None and ultrasound.amniotic_fluid_index < 5.0:
        alert = Alert(
            pregnancy_id=ultrasound.pregnancy_id,
            type="anomaly",
            severity="critical",
            description=(
                f"Oligohydramnios detected: AFI {ultrasound.amniotic_fluid_index} cm "
                f"(normal > 5 cm). Immediate evaluation required."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        alerts_created.append(alert)

    if alerts_created:
        await db.flush()

    return alerts_created
