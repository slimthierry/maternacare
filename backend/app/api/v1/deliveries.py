"""Delivery management endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.models.user_models import User
from app.schemas.delivery_schemas import (
    DeliveryCreate,
    DeliveryListResponse,
    DeliveryResponse,
    DeliveryUpdate,
)
from app.services import delivery_service

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.post("/", response_model=DeliveryResponse, status_code=201)
async def create_delivery(
    data: DeliveryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("deliveries:write")),
):
    """Record a new delivery."""
    delivery = await delivery_service.create_delivery(db, data, current_user)
    return DeliveryResponse.model_validate(delivery)


@router.get("/", response_model=DeliveryListResponse)
async def list_deliveries(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("deliveries:read")),
):
    """List deliveries with pagination."""
    return await delivery_service.list_deliveries(db, page, page_size)


@router.get("/{delivery_id}", response_model=DeliveryResponse)
async def get_delivery(
    delivery_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("deliveries:read")),
):
    """Get a delivery by ID."""
    delivery = await delivery_service.get_delivery(db, delivery_id)
    return DeliveryResponse.model_validate(delivery)


@router.put("/{delivery_id}", response_model=DeliveryResponse)
async def update_delivery(
    delivery_id: int,
    data: DeliveryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("deliveries:write")),
):
    """Update a delivery record."""
    delivery = await delivery_service.update_delivery(db, delivery_id, data)
    return DeliveryResponse.model_validate(delivery)
