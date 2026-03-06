"""Patient management endpoints."""

import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import get_current_user, require_permission
from app.models.user_models import User
from app.schemas.patient_schemas import (
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)
from app.services import patient_service

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=PatientResponse, status_code=201)
async def create_patient(
    data: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:write")),
):
    """Register a new patient."""
    patient = await patient_service.create_patient(db, data)
    return PatientResponse.model_validate(patient)


@router.get("/", response_model=PatientListResponse)
async def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:read")),
):
    """List patients with search and pagination."""
    return await patient_service.list_patients(db, page, page_size, search)


@router.get("/ipp/{ipp}", response_model=PatientResponse)
async def get_patient_by_ipp(
    ipp: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:read")),
):
    """Get a patient by IPP number."""
    patient = await patient_service.get_patient_by_ipp(db, ipp)
    return PatientResponse.model_validate(patient)


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:read")),
):
    """Get a patient by ID."""
    patient = await patient_service.get_patient(db, patient_id)
    return PatientResponse.model_validate(patient)


@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    data: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:write")),
):
    """Update a patient record."""
    patient = await patient_service.update_patient(db, patient_id, data)
    return PatientResponse.model_validate(patient)


@router.delete("/{patient_id}", status_code=204)
async def delete_patient(
    patient_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:delete")),
):
    """Delete a patient record."""
    await patient_service.delete_patient(db, patient_id)


@router.get("/export/csv")
async def export_patients_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("patients:read")),
):
    """Export all patients as CSV file."""
    result = await patient_service.list_patients(db, page=1, page_size=10000)

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["IPP", "Nom", "Prenom", "Date de naissance", "Groupe sanguin", "Rhesus", "Telephone", "Contact urgence"])
    for p in result.items:
        writer.writerow([p.ipp, p.last_name, p.first_name, p.date_of_birth, p.blood_type or "", p.rh_factor or "", p.phone or "", p.emergency_contact or ""])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=patients_maternacare.csv"},
    )
