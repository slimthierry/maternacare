"""Alert management endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.models.user_models import User
from app.schemas.alert_schemas import (
    AlertCreate,
    AlertListResponse,
    AlertResponse,
)
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(
    data: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:write")),
):
    """Create a new clinical alert."""
    alert = await alert_service.create_alert(db, data)
    return AlertResponse.model_validate(alert)


@router.get("/", response_model=AlertListResponse)
async def list_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    severity: str | None = None,
    pregnancy_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:read")),
):
    """List alerts with filters and pagination."""
    return await alert_service.list_alerts(db, page, page_size, status, severity, pregnancy_id)


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:read")),
):
    """Get an alert by ID."""
    alert = await alert_service.get_alert(db, alert_id)
    return AlertResponse.model_validate(alert)


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:acknowledge")),
):
    """Acknowledge an active alert."""
    alert = await alert_service.acknowledge_alert(db, alert_id, current_user)
    return AlertResponse.model_validate(alert)


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("alerts:acknowledge")),
):
    """Resolve an alert."""
    alert = await alert_service.resolve_alert(db, alert_id)
    return AlertResponse.model_validate(alert)
