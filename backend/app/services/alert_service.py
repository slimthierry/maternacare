"""Alert service for clinical risk notification management."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import NotFoundException
from app.models.alert_models import Alert
from app.models.user_models import User
from app.schemas.alert_schemas import (
    AlertCreate,
    AlertListResponse,
    AlertResponse,
)


async def create_alert(db: AsyncSession, data: AlertCreate) -> Alert:
    """Create a new alert."""
    alert = Alert(
        **data.model_dump(),
        detected_at=datetime.now(timezone.utc),
        status="active",
    )
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    return alert


async def get_alert(db: AsyncSession, alert_id: int) -> Alert:
    """Get an alert by ID."""
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalar_one_or_none()
    if alert is None:
        raise NotFoundException("Alert", alert_id)
    return alert


async def list_alerts(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    severity: str | None = None,
    pregnancy_id: int | None = None,
) -> AlertListResponse:
    """List alerts with filters and pagination."""
    query = select(Alert)

    if status:
        query = query.where(Alert.status == status)
    if severity:
        query = query.where(Alert.severity == severity)
    if pregnancy_id:
        query = query.where(Alert.pregnancy_id == pregnancy_id)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Alert.detected_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    alerts = result.scalars().all()

    return AlertListResponse(
        items=[AlertResponse.model_validate(a) for a in alerts],
        total=total,
        page=page,
        page_size=page_size,
    )


async def acknowledge_alert(
    db: AsyncSession, alert_id: int, user: User
) -> Alert:
    """Acknowledge an active alert."""
    alert = await get_alert(db, alert_id)
    alert.status = "acknowledged"
    alert.acknowledged_by = user.id
    alert.acknowledged_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(alert)
    return alert


async def resolve_alert(db: AsyncSession, alert_id: int) -> Alert:
    """Resolve an alert."""
    alert = await get_alert(db, alert_id)
    alert.status = "resolved"
    await db.flush()
    await db.refresh(alert)
    return alert
