"""Newborn management endpoints."""

from fastapi import APIRouter, Depends, Query
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
