"""FHIR Observation resource endpoint for clinical measurements."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.models.consultation_models import Consultation
from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.fhir_schemas import (
    FHIRBundle,
    FHIRBundleEntry,
    FHIRCodeableConcept,
    FHIRCoding,
    FHIRObservation,
    FHIRQuantity,
    FHIRReference,
)

router = APIRouter(prefix="/Observation")

# LOINC codes for obstetric observations
OBSERVATION_CODES = {
    "blood_pressure_systolic": ("8480-6", "Systolic blood pressure", "mmHg", "mm[Hg]"),
    "blood_pressure_diastolic": ("8462-4", "Diastolic blood pressure", "mmHg", "mm[Hg]"),
    "weight": ("29463-7", "Body weight", "kg", "kg"),
    "fetal_heart_rate": ("55283-6", "Fetal heart rate", "bpm", "/min"),
    "uterine_height": ("11881-0", "Uterine fundal height", "cm", "cm"),
    "glycemia": ("2345-7", "Glucose", "g/L", "g/L"),
}


def _consultation_to_observations(
    consultation: Consultation, patient_ipp: str
) -> list[FHIRObservation]:
    """Convert consultation measurements to FHIR Observations."""
    observations = []
    base_id = f"consult-{consultation.id}"

    measurements = [
        ("blood_pressure_systolic", consultation.blood_pressure_systolic),
        ("blood_pressure_diastolic", consultation.blood_pressure_diastolic),
        ("weight", consultation.weight_kg),
        ("fetal_heart_rate", consultation.fetal_heart_rate),
        ("uterine_height", consultation.uterine_height_cm),
        ("glycemia", consultation.glycemia),
    ]

    for key, value in measurements:
        if value is not None:
            code_info = OBSERVATION_CODES[key]
            observations.append(
                FHIRObservation(
                    id=f"{base_id}-{key}",
                    code=FHIRCodeableConcept(
                        coding=[
                            FHIRCoding(
                                system="http://loinc.org",
                                code=code_info[0],
                                display=code_info[1],
                            )
                        ],
                    ),
                    subject=FHIRReference(reference=f"Patient/{patient_ipp}"),
                    effectiveDateTime=str(consultation.date),
                    valueQuantity=FHIRQuantity(
                        value=float(value),
                        unit=code_info[2],
                        code=code_info[3],
                    ),
                )
            )

    return observations


@router.get("/", response_model=FHIRBundle)
async def search_fhir_observations(
    patient: str | None = Query(None, description="Patient IPP"),
    code: str | None = Query(None, description="LOINC code"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fhir:read")),
):
    """Search FHIR Observation resources."""
    query = select(Consultation)

    if patient:
        query = (
            query.join(Pregnancy, Consultation.pregnancy_id == Pregnancy.id)
            .join(Patient, Pregnancy.patient_id == Patient.id)
            .where(Patient.ipp == patient)
        )

    query = query.order_by(Consultation.date.desc()).limit(20)
    result = await db.execute(query)
    consultations = result.scalars().all()

    entries = []
    for consultation in consultations:
        pregnancy = await db.get(Pregnancy, consultation.pregnancy_id)
        patient_ipp = ""
        if pregnancy and pregnancy.patient:
            patient_ipp = pregnancy.patient.ipp

        observations = _consultation_to_observations(consultation, patient_ipp)

        # Filter by LOINC code if specified
        if code:
            observations = [
                obs
                for obs in observations
                if any(c.code == code for c in obs.code.coding)
            ]

        for obs in observations:
            entries.append(FHIRBundleEntry(resource=obs.model_dump()))

    return FHIRBundle(total=len(entries), entry=entries)
