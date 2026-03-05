"""Delivery service for birth record management."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import ConflictException, NotFoundException
from app.models.delivery_models import Delivery
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.delivery_schemas import (
    DeliveryCreate,
    DeliveryListResponse,
    DeliveryResponse,
    DeliveryUpdate,
)


async def create_delivery(
    db: AsyncSession, data: DeliveryCreate, practitioner: User
) -> Delivery:
    """Create a new delivery record."""
    # Verify pregnancy exists
    result = await db.execute(
        select(Pregnancy).where(Pregnancy.id == data.pregnancy_id)
    )
    pregnancy = result.scalar_one_or_none()
    if pregnancy is None:
        raise NotFoundException("Pregnancy", data.pregnancy_id)

    # Check no existing delivery for this pregnancy
    existing = await db.execute(
        select(Delivery).where(Delivery.pregnancy_id == data.pregnancy_id)
    )
    if existing.scalar_one_or_none():
        raise ConflictException(
            f"Delivery already recorded for pregnancy {data.pregnancy_id}"
        )

    delivery = Delivery(
        **data.model_dump(),
        practitioner_id=practitioner.id,
    )
    db.add(delivery)

    # Update pregnancy status
    pregnancy.status = "delivered"
    pregnancy.actual_due_date = data.date

    await db.flush()
    await db.refresh(delivery)
    return delivery


async def get_delivery(db: AsyncSession, delivery_id: int) -> Delivery:
    """Get a delivery by ID."""
    result = await db.execute(
        select(Delivery).where(Delivery.id == delivery_id)
    )
    delivery = result.scalar_one_or_none()
    if delivery is None:
        raise NotFoundException("Delivery", delivery_id)
    return delivery


async def list_deliveries(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
) -> DeliveryListResponse:
    """List deliveries with pagination."""
    query = select(Delivery)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Delivery.date.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    deliveries = result.scalars().all()

    return DeliveryListResponse(
        items=[DeliveryResponse.model_validate(d) for d in deliveries],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_delivery(
    db: AsyncSession, delivery_id: int, data: DeliveryUpdate
) -> Delivery:
    """Update a delivery record."""
    delivery = await get_delivery(db, delivery_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(delivery, key, value)

    await db.flush()
    await db.refresh(delivery)
    return delivery
