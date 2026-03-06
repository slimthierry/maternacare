"""Ultrasound schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class UltrasoundBase(BaseModel):
    """Base ultrasound fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=1, le=45)
    type: str
    fetal_weight_g: int | None = Field(default=None, ge=1, le=6000)
    biparietal_diameter_mm: float | None = Field(default=None, ge=5, le=120)
    femur_length_mm: float | None = Field(default=None, ge=3, le=90)
    abdominal_circumference_mm: float | None = Field(default=None, ge=20, le=450)
    amniotic_fluid_index: float | None = Field(default=None, ge=0, le=40)
    placenta_position: str | None = None
    fetal_heart_rate: int | None = Field(default=None, ge=60, le=220)
    anomalies_detected: list[str] | None = None
    notes: str | None = None

    @field_validator("type")
    @classmethod
    def valid_type(cls, v: str) -> str:
        if v not in ("dating", "morphology", "growth", "doppler"):
            raise ValueError("Type d'echographie invalide (dating, morphology, growth, doppler)")
        return v

    @field_validator("placenta_position")
    @classmethod
    def valid_placenta(cls, v: str | None) -> str | None:
        if v is not None and v not in ("anterior", "posterior", "fundal", "lateral", "previa"):
            raise ValueError("Position du placenta invalide")
        return v


class UltrasoundCreate(UltrasoundBase):
    """Fields required to create an ultrasound record."""

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date d'echographie ne peut pas etre dans le futur")
        return v


class UltrasoundUpdate(BaseModel):
    """Fields that can be updated on an ultrasound."""

    fetal_weight_g: int | None = Field(default=None, ge=1, le=6000)
    biparietal_diameter_mm: float | None = Field(default=None, ge=5, le=120)
    femur_length_mm: float | None = Field(default=None, ge=3, le=90)
    abdominal_circumference_mm: float | None = Field(default=None, ge=20, le=450)
    amniotic_fluid_index: float | None = Field(default=None, ge=0, le=40)
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
