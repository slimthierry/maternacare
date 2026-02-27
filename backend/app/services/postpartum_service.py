"""PostPartum service for post-delivery follow-up management."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.alert_models import Alert
from app.models.postpartum_models import PostPartum
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.postpartum_schemas import (
    PostPartumCreate,
    PostPartumListResponse,
    PostPartumResponse,
    PostPartumUpdate,
)


async def create_postpartum(
    db: AsyncSession, data: PostPartumCreate, practitioner: User
) -> PostPartum:
    """Create a new post-partum visit record."""
    result = await db.execute(
        select(Pregnancy).where(Pregnancy.id == data.pregnancy_id)
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundException("Pregnancy", data.pregnancy_id)

    visit = PostPartum(
        **data.model_dump(),
        practitioner_id=practitioner.id,
    )
    db.add(visit)
    await db.flush()
    await db.refresh(visit)

    # Auto-alert on Edinburgh score >= 13
    if data.edinburgh_score is not None and data.edinburgh_score >= 13:
        severity = "critical" if data.edinburgh_score >= 20 else "warning"
        alert = Alert(
            pregnancy_id=data.pregnancy_id,
            type="postpartum_depression",
            severity=severity,
            description=(
                f"Edinburgh Depression Score: {data.edinburgh_score}/30 "
                f"(threshold: 13). Score indicates risk of postnatal depression."
            ),
            detected_at=datetime.now(timezone.utc),
            status="active",
            auto_generated=True,
        )
        db.add(alert)
        await db.flush()

    return visit


async def get_postpartum(db: AsyncSession, visit_id: int) -> PostPartum:
    """Get a post-partum visit by ID."""
    result = await db.execute(
        select(PostPartum).where(PostPartum.id == visit_id)
    )
    visit = result.scalar_one_or_none()
    if visit is None:
        raise NotFoundException("PostPartum visit", visit_id)
    return visit


async def list_postpartum(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    pregnancy_id: int | None = None,
) -> PostPartumListResponse:
    """List post-partum visits with optional filter and pagination."""
    query = select(PostPartum)

    if pregnancy_id:
        query = query.where(PostPartum.pregnancy_id == pregnancy_id)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(PostPartum.date.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    visits = result.scalars().all()

    return PostPartumListResponse(
        items=[PostPartumResponse.model_validate(v) for v in visits],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_postpartum(
    db: AsyncSession, visit_id: int, data: PostPartumUpdate
) -> PostPartum:
    """Update a post-partum visit record."""
    visit = await get_postpartum(db, visit_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(visit, key, value)

    await db.flush()
    await db.refresh(visit)
    return visit
