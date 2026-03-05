"""Ultrasound service for imaging examination management."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import NotFoundException
from app.models.pregnancy_models import Pregnancy
from app.models.ultrasound_models import Ultrasound
from app.models.user_models import User
from app.schemas.ultrasound_schemas import (
    UltrasoundCreate,
    UltrasoundListResponse,
    UltrasoundResponse,
    UltrasoundUpdate,
)
from app.services.risk_assessment_service import assess_ultrasound_risk


async def create_ultrasound(
    db: AsyncSession, data: UltrasoundCreate, practitioner: User
) -> Ultrasound:
    """Create a new ultrasound record and trigger risk assessment."""
    result = await db.execute(
        select(Pregnancy).where(Pregnancy.id == data.pregnancy_id)
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundException("Pregnancy", data.pregnancy_id)

    ultrasound = Ultrasound(
        **data.model_dump(),
        practitioner_id=practitioner.id,
    )
    db.add(ultrasound)
    await db.flush()
    await db.refresh(ultrasound)

    # Trigger risk assessment
    await assess_ultrasound_risk(db, ultrasound)

    return ultrasound


async def get_ultrasound(db: AsyncSession, ultrasound_id: int) -> Ultrasound:
    """Get an ultrasound by ID."""
    result = await db.execute(
        select(Ultrasound).where(Ultrasound.id == ultrasound_id)
    )
    ultrasound = result.scalar_one_or_none()
    if ultrasound is None:
        raise NotFoundException("Ultrasound", ultrasound_id)
    return ultrasound


async def list_ultrasounds(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    pregnancy_id: int | None = None,
) -> UltrasoundListResponse:
    """List ultrasounds with optional filter and pagination."""
    query = select(Ultrasound)

    if pregnancy_id:
        query = query.where(Ultrasound.pregnancy_id == pregnancy_id)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Ultrasound.date.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    ultrasounds = result.scalars().all()

    return UltrasoundListResponse(
        items=[UltrasoundResponse.model_validate(u) for u in ultrasounds],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_ultrasound(
    db: AsyncSession, ultrasound_id: int, data: UltrasoundUpdate
) -> Ultrasound:
    """Update an ultrasound record."""
    ultrasound = await get_ultrasound(db, ultrasound_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ultrasound, key, value)

    await db.flush()
    await db.refresh(ultrasound)
    return ultrasound
