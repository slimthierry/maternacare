"""Pregnancy management endpoints."""

import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.user_models import User
from app.schemas.pregnancy_schemas import (
    PregnancyCreate,
    PregnancyDetailResponse,
    PregnancyListResponse,
    PregnancyResponse,
    PregnancyUpdate,
)
from app.services import pregnancy_service

router = APIRouter(prefix="/pregnancies", tags=["Pregnancies"])


@router.post("/", response_model=PregnancyResponse, status_code=201)
async def create_pregnancy(
    data: PregnancyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("pregnancies:write")),
):
    """Create a new pregnancy record."""
    pregnancy = await pregnancy_service.create_pregnancy(db, data)
    return PregnancyResponse.model_validate(pregnancy)


@router.get("/", response_model=PregnancyListResponse)
async def list_pregnancies(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    patient_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("pregnancies:read")),
):
    """List pregnancies with filters and pagination."""
    return await pregnancy_service.list_pregnancies(db, page, page_size, status, patient_id)


@router.get("/export/csv")
async def export_pregnancies_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("pregnancies:read")),
):
    """Export all pregnancies as CSV file."""
    result = await pregnancy_service.list_pregnancies(db, page=1, page_size=10000)

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["ID", "Patient ID", "DDR", "DPA", "DPA reelle", "Statut", "Risque", "Gravida", "Para", "Notes"])
    for p in result.items:
        writer.writerow([
            p.id, p.patient_id, p.lmp_date, p.estimated_due_date,
            p.actual_due_date or "", p.status, p.risk_level,
            p.gravida, p.para, p.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=grossesses_maternacare.csv"},
    )


@router.get("/{pregnancy_id}", response_model=PregnancyDetailResponse)
async def get_pregnancy(
    pregnancy_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("pregnancies:read")),
):
    """Get a pregnancy with detailed information."""
    return await pregnancy_service.get_pregnancy_detail(db, pregnancy_id)


@router.put("/{pregnancy_id}", response_model=PregnancyResponse)
async def update_pregnancy(
    pregnancy_id: int,
    data: PregnancyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("pregnancies:write")),
):
    """Update a pregnancy record."""
    pregnancy = await pregnancy_service.update_pregnancy(db, pregnancy_id, data)
    return PregnancyResponse.model_validate(pregnancy)
