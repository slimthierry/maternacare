"""Post-partum follow-up endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.user_models import User
from app.schemas.postpartum_schemas import (
    PostPartumCreate,
    PostPartumListResponse,
    PostPartumResponse,
    PostPartumUpdate,
)
from app.services import postpartum_service

router = APIRouter(prefix="/postpartum", tags=["PostPartum"])


@router.post("/", response_model=PostPartumResponse, status_code=201)
async def create_postpartum(
    data: PostPartumCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("postpartum:write")),
):
    """Record a new post-partum visit."""
    visit = await postpartum_service.create_postpartum(db, data, current_user)
    return PostPartumResponse.model_validate(visit)


@router.get("/", response_model=PostPartumListResponse)
async def list_postpartum(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    pregnancy_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("postpartum:read")),
):
    """List post-partum visits with optional filter and pagination."""
    return await postpartum_service.list_postpartum(db, page, page_size, pregnancy_id)


@router.get("/{visit_id}", response_model=PostPartumResponse)
async def get_postpartum(
    visit_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("postpartum:read")),
):
    """Get a post-partum visit by ID."""
    visit = await postpartum_service.get_postpartum(db, visit_id)
    return PostPartumResponse.model_validate(visit)


@router.put("/{visit_id}", response_model=PostPartumResponse)
async def update_postpartum(
    visit_id: int,
    data: PostPartumUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("postpartum:write")),
):
    """Update a post-partum visit record."""
    visit = await postpartum_service.update_postpartum(db, visit_id, data)
    return PostPartumResponse.model_validate(visit)
