"""Ultrasound schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field


class UltrasoundBase(BaseModel):
    """Base ultrasound fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=1, le=45)
    type: str  # dating, morphology, growth, doppler
    fetal_weight_g: int | None = None
    biparietal_diameter_mm: float | None = None
    femur_length_mm: float | None = None
    abdominal_circumference_mm: float | None = None
    amniotic_fluid_index: float | None = None
    placenta_position: str | None = None
    fetal_heart_rate: int | None = None
    anomalies_detected: list[str] | None = None
    notes: str | None = None


class UltrasoundCreate(UltrasoundBase):
    """Fields required to create an ultrasound record."""

    pass


class UltrasoundUpdate(BaseModel):
    """Fields that can be updated on an ultrasound."""

    fetal_weight_g: int | None = None
    biparietal_diameter_mm: float | None = None
    femur_length_mm: float | None = None
    abdominal_circumference_mm: float | None = None
    amniotic_fluid_index: float | None = None
    placenta_position: str | None = None
    anomalies_detected: list[str] | None = None
    notes: str | None = None


class UltrasoundResponse(UltrasoundBase):
    """Ultrasound response with all fields."""

    id: int
    practitioner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UltrasoundListResponse(BaseModel):
    """Paginated list of ultrasounds."""

    items: list[UltrasoundResponse]
    total: int
    page: int
    page_size: int
