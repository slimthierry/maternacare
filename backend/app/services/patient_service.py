"""Patient service for CRUD operations."""

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.exceptions import ConflictException, NotFoundException
from app.models.patient_models import Patient
from app.schemas.patient_schemas import (
    PatientCreate,
    PatientListResponse,
    PatientResponse,
    PatientUpdate,
)


async def create_patient(db: AsyncSession, data: PatientCreate) -> Patient:
    """Create a new patient record."""
    # Check IPP uniqueness
    result = await db.execute(select(Patient).where(Patient.ipp == data.ipp))
    if result.scalar_one_or_none():
        raise ConflictException(f"Patient with IPP '{data.ipp}' already exists")

    patient = Patient(**data.model_dump())
    db.add(patient)
    await db.flush()
    await db.refresh(patient)
    return patient


async def get_patient(db: AsyncSession, patient_id: int) -> Patient:
    """Get a patient by ID."""
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise NotFoundException("Patient", patient_id)
    return patient


async def get_patient_by_ipp(db: AsyncSession, ipp: str) -> Patient:
    """Get a patient by IPP number."""
    result = await db.execute(select(Patient).where(Patient.ipp == ipp))
    patient = result.scalar_one_or_none()
    if patient is None:
        raise NotFoundException("Patient", ipp)
    return patient


async def list_patients(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
) -> PatientListResponse:
    """List patients with optional search and pagination."""
    query = select(Patient)

    if search:
        search_filter = or_(
            Patient.ipp.ilike(f"%{search}%"),
            Patient.first_name.ilike(f"%{search}%"),
            Patient.last_name.ilike(f"%{search}%"),
        )
        query = query.where(search_filter)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate
    query = query.order_by(Patient.last_name, Patient.first_name)
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    patients = result.scalars().all()

    return PatientListResponse(
        items=[PatientResponse.model_validate(p) for p in patients],
        total=total,
        page=page,
        page_size=page_size,
    )


async def update_patient(
    db: AsyncSession, patient_id: int, data: PatientUpdate
) -> Patient:
    """Update a patient record."""
    patient = await get_patient(db, patient_id)

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(patient, key, value)

    await db.flush()
    await db.refresh(patient)
    return patient


async def delete_patient(db: AsyncSession, patient_id: int) -> None:
    """Delete a patient record."""
    patient = await get_patient(db, patient_id)
    await db.delete(patient)
    await db.flush()
