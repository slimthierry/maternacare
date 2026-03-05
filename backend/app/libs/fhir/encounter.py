"""FHIR Encounter resource endpoint for consultations."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.consultation_models import Consultation
from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.fhir_schemas import (
    FHIRBundle,
    FHIRBundleEntry,
    FHIRCodeableConcept,
    FHIRCoding,
    FHIREncounter,
    FHIRPeriod,
    FHIRReference,
)

router = APIRouter(prefix="/Encounter")

ENCOUNTER_TYPES = {
    "routine": ("185349003", "Encounter for check up"),
    "urgent": ("183460006", "Urgent encounter"),
    "specialist": ("11429006", "Specialist consultation"),
}


def _to_fhir_encounter(
    consultation: Consultation,
    patient_ipp: str,
    practitioner_name: str,
) -> FHIREncounter:
    """Convert a Consultation to a FHIR Encounter resource."""
    encounter_type = ENCOUNTER_TYPES.get(
        consultation.consultation_type, ("185349003", "Encounter for check up")
    )

    return FHIREncounter(
        id=str(consultation.id),
        status="finished",
        class_=FHIRCoding(
            system="http://terminology.hl7.org/CodeSystem/v3-ActCode",
            code="AMB",
            display="Ambulatory",
        ),
        type=[
            FHIRCodeableConcept(
                coding=[
                    FHIRCoding(
                        system="http://snomed.info/sct",
                        code=encounter_type[0],
                        display=encounter_type[1],
                    )
                ],
            )
        ],
        subject=FHIRReference(reference=f"Patient/{patient_ipp}"),
        period=FHIRPeriod(start=str(consultation.date)),
        participant=[
            FHIRReference(
                reference=f"Practitioner/{consultation.practitioner_id}",
                display=practitioner_name,
            )
        ],
    )


@router.get("/", response_model=FHIRBundle)
async def search_fhir_encounters(
    patient: str | None = Query(None, description="Patient IPP"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fhir:read")),
):
    """Search FHIR Encounter resources."""
    query = select(Consultation)

    if patient:
        query = (
            query.join(Pregnancy, Consultation.pregnancy_id == Pregnancy.id)
            .join(Patient, Pregnancy.patient_id == Patient.id)
            .where(Patient.ipp == patient)
        )

    query = query.order_by(Consultation.date.desc()).limit(50)
    result = await db.execute(query)
    consultations = result.scalars().all()

    entries = []
    for consultation in consultations:
        pregnancy = await db.get(Pregnancy, consultation.pregnancy_id)
        patient_ipp = ""
        if pregnancy and pregnancy.patient:
            patient_ipp = pregnancy.patient.ipp

        practitioner = await db.get(User, consultation.practitioner_id)
        practitioner_name = practitioner.name if practitioner else ""

        encounter = _to_fhir_encounter(consultation, patient_ipp, practitioner_name)
        entries.append(FHIRBundleEntry(resource=encounter.model_dump()))

    return FHIRBundle(total=len(entries), entry=entries)
