"""Pregnancy schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel


class PregnancyBase(BaseModel):
    """Base pregnancy fields."""

    patient_id: int
    lmp_date: date
    estimated_due_date: date
    gravida: int = 1
    para: int = 0
    notes: str | None = None


class PregnancyCreate(PregnancyBase):
    """Fields required to create a pregnancy record."""

    pass


class PregnancyUpdate(BaseModel):
    """Fields that can be updated on a pregnancy."""

    actual_due_date: date | None = None
    status: str | None = None
    risk_level: str | None = None
    notes: str | None = None


class PregnancyResponse(PregnancyBase):
    """Pregnancy response with all fields."""

    id: int
    actual_due_date: date | None = None
    status: str
    risk_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class PregnancyDetailResponse(PregnancyResponse):
    """Pregnancy response with related data counts."""

    consultations_count: int = 0
    ultrasounds_count: int = 0
    alerts_count: int = 0
    patient_name: str = ""


class PregnancyListResponse(BaseModel):
    """Paginated list of pregnancies."""

    items: list[PregnancyResponse]
    total: int
    page: int
    page_size: int
