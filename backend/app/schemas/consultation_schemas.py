"""Consultation schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class ConsultationBase(BaseModel):
    """Base consultation fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=1, le=45)
    weight_kg: float | None = Field(default=None, ge=30, le=200)
    blood_pressure_systolic: int | None = Field(default=None, ge=60, le=250)
    blood_pressure_diastolic: int | None = Field(default=None, ge=30, le=180)
    uterine_height_cm: float | None = Field(default=None, ge=5, le=50)
    fetal_heart_rate: int | None = Field(default=None, ge=60, le=220)
    glycemia: float | None = Field(default=None, ge=0.1, le=5.0)
    proteinuria: str | None = None
    edema: str | None = None
    consultation_type: str = "routine"
    notes: str | None = None
    next_appointment: date | None = None

    @field_validator("proteinuria")
    @classmethod
    def valid_proteinuria(cls, v: str | None) -> str | None:
        if v is not None and v not in ("negative", "trace", "1+", "2+", "3+", "4+"):
            raise ValueError("Proteinurie invalide")
        return v

    @field_validator("edema")
    @classmethod
    def valid_edema(cls, v: str | None) -> str | None:
        if v is not None and v not in ("none", "mild", "moderate", "severe"):
            raise ValueError("Oedeme invalide")
        return v

    @field_validator("consultation_type")
    @classmethod
    def valid_type(cls, v: str) -> str:
        if v not in ("routine", "urgent", "specialist"):
            raise ValueError("Type de consultation invalide")
        return v


class ConsultationCreate(ConsultationBase):
    """Fields required to create a consultation."""

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date de consultation ne peut pas etre dans le futur")
        return v

    @field_validator("next_appointment")
    @classmethod
    def next_appt_in_future(cls, v: date | None) -> date | None:
        if v is not None and v < date.today():
            raise ValueError("Le prochain RDV doit etre dans le futur")
        return v


class ConsultationUpdate(BaseModel):
    """Fields that can be updated on a consultation."""

    weight_kg: float | None = Field(default=None, ge=30, le=200)
    blood_pressure_systolic: int | None = Field(default=None, ge=60, le=250)
    blood_pressure_diastolic: int | None = Field(default=None, ge=30, le=180)
    uterine_height_cm: float | None = Field(default=None, ge=5, le=50)
    fetal_heart_rate: int | None = Field(default=None, ge=60, le=220)
    glycemia: float | None = Field(default=None, ge=0.1, le=5.0)
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
