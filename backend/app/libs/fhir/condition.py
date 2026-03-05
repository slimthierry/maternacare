"""FHIR Condition resource endpoint for obstetric complications."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.alert_models import Alert
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.fhir_schemas import (
    FHIRBundle,
    FHIRBundleEntry,
    FHIRCodeableConcept,
    FHIRCoding,
    FHIRCondition,
    FHIRReference,
)

router = APIRouter(prefix="/Condition")

# Standard obstetric complication codes (ICD-10)
OBSTETRIC_CODES = {
    "pre_eclampsia": ("O14.9", "Pre-eclampsia, unspecified"),
    "gestational_diabetes": ("O24.4", "Gestational diabetes mellitus"),
    "iugr": ("O36.5", "Maternal care for poor fetal growth"),
    "preterm_labor": ("O60.0", "Preterm labor without delivery"),
    "placenta_previa": ("O44.0", "Placenta previa"),
    "rh_incompatibility": ("O36.0", "Maternal care for rhesus isoimmunization"),
    "anomaly": ("O35.9", "Maternal care for fetal abnormality, unspecified"),
    "postpartum_depression": ("F53.0", "Postpartum depression"),
}


def _to_fhir_condition(alert: Alert, patient_ipp: str) -> FHIRCondition:
    """Convert an Alert to a FHIR Condition resource."""
    code_info = OBSTETRIC_CODES.get(alert.type, ("unknown", alert.type))

    clinical_status = "active" if alert.status == "active" else "resolved"

    severity_map = {
        "info": ("24484000", "Mild"),
        "warning": ("6736007", "Moderate"),
        "critical": ("24112005", "Severe"),
    }
    sev = severity_map.get(alert.severity, ("6736007", "Moderate"))

    return FHIRCondition(
        id=str(alert.id),
        subject=FHIRReference(
            reference=f"Patient/{patient_ipp}",
        ),
        code=FHIRCodeableConcept(
            coding=[
                FHIRCoding(
                    system="http://hl7.org/fhir/sid/icd-10",
                    code=code_info[0],
                    display=code_info[1],
                )
            ],
            text=alert.description,
        ),
        clinicalStatus=FHIRCodeableConcept(
            coding=[
                FHIRCoding(
                    system="http://terminology.hl7.org/CodeSystem/condition-clinical",
                    code=clinical_status,
                    display=clinical_status.capitalize(),
                )
            ],
        ),
        severity=FHIRCodeableConcept(
            coding=[
                FHIRCoding(
                    system="http://snomed.info/sct",
                    code=sev[0],
                    display=sev[1],
                )
            ],
        ),
        onsetDateTime=alert.detected_at.isoformat() if alert.detected_at else None,
        recordedDate=alert.created_at.isoformat(),
    )


@router.get("/", response_model=FHIRBundle)
async def search_fhir_conditions(
    patient: str | None = Query(None, description="Patient IPP"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fhir:read")),
):
    """Search FHIR Condition resources."""
    query = select(Alert)

    if patient:
        # Join through pregnancy to patient
        query = (
            query.join(Pregnancy, Alert.pregnancy_id == Pregnancy.id)
            .join(
                __import__("app.models.patient_models", fromlist=["Patient"]).Patient,
                Pregnancy.patient_id
                == __import__("app.models.patient_models", fromlist=["Patient"]).Patient.id,
            )
        )
        from app.models.patient_models import Patient

        query = (
            select(Alert)
            .join(Pregnancy, Alert.pregnancy_id == Pregnancy.id)
            .join(Patient, Pregnancy.patient_id == Patient.id)
            .where(Patient.ipp == patient)
        )

    query = query.limit(50)
    result = await db.execute(query)
    alerts = result.scalars().all()

    entries = []
    for alert in alerts:
        pregnancy = await db.get(Pregnancy, alert.pregnancy_id)
        patient_ipp = ""
        if pregnancy and pregnancy.patient:
            patient_ipp = pregnancy.patient.ipp
        entries.append(
            FHIRBundleEntry(
                resource=_to_fhir_condition(alert, patient_ipp).model_dump()
            )
        )

    return FHIRBundle(total=len(entries), entry=entries)
