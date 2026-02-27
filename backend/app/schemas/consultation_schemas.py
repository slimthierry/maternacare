"""Consultation schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field


class ConsultationBase(BaseModel):
    """Base consultation fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=1, le=45)
    weight_kg: float | None = None
    blood_pressure_systolic: int | None = None
    blood_pressure_diastolic: int | None = None
    uterine_height_cm: float | None = None
    fetal_heart_rate: int | None = None
    glycemia: float | None = None
    proteinuria: str | None = None
    edema: str | None = None
    consultation_type: str = "routine"
    notes: str | None = None
    next_appointment: date | None = None


class ConsultationCreate(ConsultationBase):
    """Fields required to create a consultation."""

    pass


class ConsultationUpdate(BaseModel):
    """Fields that can be updated on a consultation."""

    weight_kg: float | None = None
    blood_pressure_systolic: int | None = None
    blood_pressure_diastolic: int | None = None
    uterine_height_cm: float | None = None
    fetal_heart_rate: int | None = None
    glycemia: float | None = None
    proteinuria: str | None = None
    edema: str | None = None
    notes: str | None = None
    next_appointment: date | None = None


class ConsultationResponse(ConsultationBase):
    """Consultation response with all fields."""

    id: int
    practitioner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ConsultationListResponse(BaseModel):
    """Paginated list of consultations."""

    items: list[ConsultationResponse]
    total: int
    page: int
    page_size: int
