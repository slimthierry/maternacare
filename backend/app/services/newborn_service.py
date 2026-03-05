"""Newborn service for baby record management."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import ConflictException, NotFoundException
from app.models.alert_models import Alert
from app.models.delivery_models import Delivery
from app.models.newborn_models import Newborn
from app.schemas.newborn_schemas import (
    NewbornCreate,
    NewbornListResponse,
    NewbornResponse,
    NewbornUpdate,
)


async def create_newborn(db: AsyncSession, data: NewbornCreate) -> Newborn:
    """Create a new newborn record."""
    # Verify delivery exists
    result = await db.execute(
        select(Delivery).where(Delivery.id == data.delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if delivery is None:
        raise NotFoundException("Delivery", data.delivery_id)

    # Check no existing newborn for this delivery
    existing = await db.execute(
        select(Newborn).where(Newborn.delivery_id == data.delivery_id)
    )
    if existing.scalar_one_or_none():
        raise ConflictException(
            f"Newborn already recorded for delivery {data.delivery_id}"
        )

    newborn = Newborn(**data.model_dump())
    db.add(newborn)
    await db.flush()
    await db.refresh(newborn)

    # Alert on low APGAR scores
    for label, score in [
        ("1min", data.apgar_1min),
        ("5min", data.apgar_5min),
        ("10min", data.apgar_10min),
    ]:
        if score is not None and score < 7:
            severity = "critical" if score < 4 else "warning"
            alert = Alert(
                pregnancy_id=delivery.pregnancy_id,
                type="anomaly",
                severity=severity,
                description=(
                    f"Low APGAR score at {label}: {score}/10. "
                    f"Immediate neonatal evaluation required."
                ),
                detected_at=datetime.now(timezone.utc),
                status="active",
                auto_generated=True,
            )
            db.add(alert)

    await db.flush()
    return newborn


async def get_newborn(db: AsyncSession, newborn_id: int) -> Newborn:
    """Get a newborn by ID."""
    result = await db.execute(
        select(Newborn).where(Newborn.id == newborn_id)
    )
    newborn = result.scalar_one_or_none()
    if newborn is None:
        raise NotFoundException("Newborn", newborn_id)
    return newborn


async def list_newborns(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
) -> NewbornListResponse:
    """List newborns with pagination."""
    query = select(Newborn)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Newborn.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    newborns = result.scalars().all()

    return NewbornListResponse(
        items=[NewbornResponse.model_validate(n) for n in newborns],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_newborn(
    db: AsyncSession, newborn_id: int, data: NewbornUpdate
) -> Newborn:
    """Update a newborn record."""
    newborn = await get_newborn(db, newborn_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(newborn, key, value)

    await db.flush()
    await db.refresh(newborn)
    return newborn
