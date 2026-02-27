"""FHIR Patient resource endpoint."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.core.exceptions import NotFoundException
from app.models.patient_models import Patient
from app.models.user_models import User
from app.schemas.fhir_schemas import (
    FHIRBundle,
    FHIRBundleEntry,
    FHIRHumanName,
    FHIRIdentifier,
    FHIRPatient,
)

router = APIRouter(prefix="/Patient")


def _to_fhir_patient(patient: Patient) -> FHIRPatient:
    """Convert a Patient model to FHIR Patient resource."""
    return FHIRPatient(
        id=str(patient.id),
        identifier=[
            FHIRIdentifier(
                system="urn:oid:1.2.250.1.213.1.4.2",  # INS-C OID for France
                value=patient.ipp,
            )
        ],
        name=[
            FHIRHumanName(
                family=patient.last_name,
                given=[patient.first_name],
            )
        ],
        gender="female",
        birthDate=str(patient.date_of_birth),
    )


@router.get("/{ipp}", response_model=FHIRPatient)
async def get_fhir_patient(
    ipp: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fhir:read")),
):
    """Get a FHIR Patient resource by IPP."""
    result = await db.execute(select(Patient).where(Patient.ipp == ipp))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise NotFoundException("FHIR Patient", ipp)
    return _to_fhir_patient(patient)


@router.get("/", response_model=FHIRBundle)
async def search_fhir_patients(
    name: str | None = Query(None),
    identifier: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("fhir:read")),
):
    """Search FHIR Patient resources."""
    query = select(Patient)

    if name:
        query = query.where(
            Patient.last_name.ilike(f"%{name}%")
            | Patient.first_name.ilike(f"%{name}%")
        )
    if identifier:
        query = query.where(Patient.ipp == identifier)

    query = query.limit(50)
    result = await db.execute(query)
    patients = result.scalars().all()

    entries = [
        FHIRBundleEntry(resource=_to_fhir_patient(p).model_dump())
        for p in patients
    ]

    return FHIRBundle(
        total=len(entries),
        entry=entries,
    )
