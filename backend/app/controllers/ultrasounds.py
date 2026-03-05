"""Ultrasound management endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.user_models import User
from app.schemas.ultrasound_schemas import (
    UltrasoundCreate,
    UltrasoundListResponse,
    UltrasoundResponse,
    UltrasoundUpdate,
)
from app.services import ultrasound_service

router = APIRouter(prefix="/ultrasounds", tags=["Ultrasounds"])


@router.post("/", response_model=UltrasoundResponse, status_code=201)
async def create_ultrasound(
    data: UltrasoundCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("ultrasounds:write")),
):
    """Record a new ultrasound examination."""
    ultrasound = await ultrasound_service.create_ultrasound(db, data, current_user)
    return UltrasoundResponse.model_validate(ultrasound)


@router.get("/", response_model=UltrasoundListResponse)
async def list_ultrasounds(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    pregnancy_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("ultrasounds:read")),
):
    """List ultrasounds with optional filter and pagination."""
    return await ultrasound_service.list_ultrasounds(db, page, page_size, pregnancy_id)


@router.get("/{ultrasound_id}", response_model=UltrasoundResponse)
async def get_ultrasound(
    ultrasound_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("ultrasounds:read")),
):
    """Get an ultrasound by ID."""
    ultrasound = await ultrasound_service.get_ultrasound(db, ultrasound_id)
    return UltrasoundResponse.model_validate(ultrasound)


@router.put("/{ultrasound_id}", response_model=UltrasoundResponse)
async def update_ultrasound(
    ultrasound_id: int,
    data: UltrasoundUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("ultrasounds:write")),
):
    """Update an ultrasound record."""
    ultrasound = await ultrasound_service.update_ultrasound(db, ultrasound_id, data)
    return UltrasoundResponse.model_validate(ultrasound)
