"""Consultation service for prenatal visit management."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.consultation_models import Consultation
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User
from app.schemas.consultation_schemas import (
    ConsultationCreate,
    ConsultationListResponse,
    ConsultationResponse,
    ConsultationUpdate,
)
from app.services.risk_assessment_service import assess_consultation_risk


async def create_consultation(
    db: AsyncSession, data: ConsultationCreate, practitioner: User
) -> Consultation:
    """Create a new consultation and trigger risk assessment."""
    # Verify pregnancy exists
    result = await db.execute(
        select(Pregnancy).where(Pregnancy.id == data.pregnancy_id)
    )
    if result.scalar_one_or_none() is None:
        raise NotFoundException("Pregnancy", data.pregnancy_id)

    consultation = Consultation(
        **data.model_dump(),
        practitioner_id=practitioner.id,
    )
    db.add(consultation)
    await db.flush()
    await db.refresh(consultation)

    # Trigger risk assessment
    await assess_consultation_risk(db, consultation)

    return consultation


async def get_consultation(db: AsyncSession, consultation_id: int) -> Consultation:
    """Get a consultation by ID."""
    result = await db.execute(
        select(Consultation).where(Consultation.id == consultation_id)
    )
    consultation = result.scalar_one_or_none()
    if consultation is None:
        raise NotFoundException("Consultation", consultation_id)
    return consultation


async def list_consultations(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    pregnancy_id: int | None = None,
) -> ConsultationListResponse:
    """List consultations with optional filter and pagination."""
    query = select(Consultation)

    if pregnancy_id:
        query = query.where(Consultation.pregnancy_id == pregnancy_id)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Consultation.date.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    consultations = result.scalars().all()

    return ConsultationListResponse(
        items=[ConsultationResponse.model_validate(c) for c in consultations],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_consultation(
    db: AsyncSession, consultation_id: int, data: ConsultationUpdate
) -> Consultation:
    """Update a consultation record."""
    consultation = await get_consultation(db, consultation_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(consultation, key, value)

    await db.flush()
    await db.refresh(consultation)
    return consultation
