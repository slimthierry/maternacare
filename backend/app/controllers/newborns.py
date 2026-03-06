"""Newborn management endpoints."""

import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.user_models import User
from app.schemas.newborn_schemas import (
    NewbornCreate,
    NewbornListResponse,
    NewbornResponse,
    NewbornUpdate,
)
from app.services import newborn_service

router = APIRouter(prefix="/newborns", tags=["Newborns"])


@router.post("/", response_model=NewbornResponse, status_code=201)
async def create_newborn(
    data: NewbornCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("newborns:write")),
):
    """Register a new newborn."""
    newborn = await newborn_service.create_newborn(db, data)
    return NewbornResponse.model_validate(newborn)


@router.get("/", response_model=NewbornListResponse)
async def list_newborns(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("newborns:read")),
):
    """List newborns with pagination."""
    return await newborn_service.list_newborns(db, page, page_size)


@router.get("/{newborn_id}", response_model=NewbornResponse)
async def get_newborn(
    newborn_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("newborns:read")),
):
    """Get a newborn by ID."""
    newborn = await newborn_service.get_newborn(db, newborn_id)
    return NewbornResponse.model_validate(newborn)


@router.put("/{newborn_id}", response_model=NewbornResponse)
async def update_newborn(
    newborn_id: int,
    data: NewbornUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("newborns:write")),
):
    """Update a newborn record."""
    newborn = await newborn_service.update_newborn(db, newborn_id, data)
    return NewbornResponse.model_validate(newborn)


@router.get("/export/csv")
async def export_newborns_csv(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("newborns:read")),
):
    """Export all newborns as CSV file."""
    result = await newborn_service.list_newborns(db, page=1, page_size=10000)

    output = io.StringIO()
    writer = csv.writer(output, delimiter=";")
    writer.writerow(["ID", "Accouchement ID", "Prenom", "Sexe", "Poids (g)", "Taille (cm)", "PC (cm)", "Groupe sanguin", "Rhesus", "APGAR 1min", "APGAR 5min", "APGAR 10min", "Reanimation", "USIN", "Notes"])
    for n in result.items:
        writer.writerow([
            n.id, n.delivery_id, n.first_name or "", n.sex, n.weight_g,
            n.height_cm or "", n.head_circumference_cm or "",
            n.blood_type or "", n.rh_factor or "",
            n.apgar_1min if n.apgar_1min is not None else "",
            n.apgar_5min if n.apgar_5min is not None else "",
            n.apgar_10min if n.apgar_10min is not None else "",
            "Oui" if n.resuscitation_needed else "Non",
            "Oui" if n.nicu_admission else "Non",
            n.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=nouveaux_nes_maternacare.csv"},
    )
