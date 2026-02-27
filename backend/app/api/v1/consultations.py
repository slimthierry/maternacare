"""Consultation management endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.models.user_models import User
from app.schemas.consultation_schemas import (
    ConsultationCreate,
    ConsultationListResponse,
    ConsultationResponse,
    ConsultationUpdate,
)
from app.services import consultation_service

router = APIRouter(prefix="/consultations", tags=["Consultations"])


@router.post("/", response_model=ConsultationResponse, status_code=201)
async def create_consultation(
    data: ConsultationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("consultations:write")),
):
    """Record a new prenatal consultation."""
    consultation = await consultation_service.create_consultation(db, data, current_user)
    return ConsultationResponse.model_validate(consultation)


@router.get("/", response_model=ConsultationListResponse)
async def list_consultations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    pregnancy_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("consultations:read")),
):
    """List consultations with optional filter and pagination."""
    return await consultation_service.list_consultations(db, page, page_size, pregnancy_id)


@router.get("/{consultation_id}", response_model=ConsultationResponse)
async def get_consultation(
    consultation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("consultations:read")),
):
    """Get a consultation by ID."""
    consultation = await consultation_service.get_consultation(db, consultation_id)
    return ConsultationResponse.model_validate(consultation)


@router.put("/{consultation_id}", response_model=ConsultationResponse)
async def update_consultation(
    consultation_id: int,
    data: ConsultationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("consultations:write")),
):
    """Update a consultation record."""
    consultation = await consultation_service.update_consultation(db, consultation_id, data)
    return ConsultationResponse.model_validate(consultation)
