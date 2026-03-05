"""Pregnancy service for CRUD operations."""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import NotFoundException
from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy
from app.schemas.pregnancy_schemas import (
    PregnancyCreate,
    PregnancyDetailResponse,
    PregnancyListResponse,
    PregnancyResponse,
    PregnancyUpdate,
)
from app.utils.pregnancy_dates import calculate_due_date


async def create_pregnancy(db: AsyncSession, data: PregnancyCreate) -> Pregnancy:
    """Create a new pregnancy record."""
    # Verify patient exists
    result = await db.execute(select(Patient).where(Patient.id == data.patient_id))
    if result.scalar_one_or_none() is None:
        raise NotFoundException("Patient", data.patient_id)

    pregnancy_data = data.model_dump()
    if not pregnancy_data.get("estimated_due_date"):
        pregnancy_data["estimated_due_date"] = calculate_due_date(data.lmp_date)

    pregnancy = Pregnancy(**pregnancy_data)
    db.add(pregnancy)
    await db.flush()
    await db.refresh(pregnancy)
    return pregnancy


async def get_pregnancy(db: AsyncSession, pregnancy_id: int) -> Pregnancy:
    """Get a pregnancy by ID with related data."""
    result = await db.execute(
        select(Pregnancy).where(Pregnancy.id == pregnancy_id)
    )
    pregnancy = result.scalar_one_or_none()
    if pregnancy is None:
        raise NotFoundException("Pregnancy", pregnancy_id)
    return pregnancy


async def get_pregnancy_detail(
    db: AsyncSession, pregnancy_id: int
) -> PregnancyDetailResponse:
    """Get detailed pregnancy info with counts."""
    pregnancy = await get_pregnancy(db, pregnancy_id)

    return PregnancyDetailResponse(
        id=pregnancy.id,
        patient_id=pregnancy.patient_id,
        lmp_date=pregnancy.lmp_date,
        estimated_due_date=pregnancy.estimated_due_date,
        actual_due_date=pregnancy.actual_due_date,
        status=pregnancy.status,
        risk_level=pregnancy.risk_level,
        gravida=pregnancy.gravida,
        para=pregnancy.para,
        notes=pregnancy.notes,
        created_at=pregnancy.created_at,
        consultations_count=len(pregnancy.consultations) if pregnancy.consultations else 0,
        ultrasounds_count=len(pregnancy.ultrasounds) if pregnancy.ultrasounds else 0,
        alerts_count=len(pregnancy.alerts) if pregnancy.alerts else 0,
        patient_name=f"{pregnancy.patient.last_name} {pregnancy.patient.first_name}" if pregnancy.patient else "",
    )


async def list_pregnancies(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    status: str | None = None,
    patient_id: int | None = None,
) -> PregnancyListResponse:
    """List pregnancies with filters and pagination."""
    query = select(Pregnancy)

    if status:
        query = query.where(Pregnancy.status == status)
    if patient_id:
        query = query.where(Pregnancy.patient_id == patient_id)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Pregnancy.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    pregnancies = result.scalars().all()

    return PregnancyListResponse(
        items=[PregnancyResponse.model_validate(p) for p in pregnancies],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_pregnancy(
    db: AsyncSession, pregnancy_id: int, data: PregnancyUpdate
) -> Pregnancy:
    """Update a pregnancy record."""
    pregnancy = await get_pregnancy(db, pregnancy_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pregnancy, key, value)

    await db.flush()
    await db.refresh(pregnancy)
    return pregnancy
