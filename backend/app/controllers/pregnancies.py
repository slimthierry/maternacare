"""Pregnancy management endpoints."""

from fastapi import APIRouter, Depends, Query
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
