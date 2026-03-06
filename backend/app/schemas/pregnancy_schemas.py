"""Pregnancy schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator, model_validator


class PregnancyBase(BaseModel):
    """Base pregnancy fields."""

    patient_id: int
    lmp_date: date
    estimated_due_date: date
    gravida: int = Field(default=1, ge=1, le=20)
    para: int = Field(default=0, ge=0, le=20)
    notes: str | None = None


class PregnancyCreate(PregnancyBase):
    """Fields required to create a pregnancy record."""

    @field_validator("lmp_date")
    @classmethod
    def lmp_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date des dernieres regles ne peut pas etre dans le futur")
        return v

    @model_validator(mode="after")
    def due_date_after_lmp(self):
        if self.estimated_due_date <= self.lmp_date:
            raise ValueError("La DPA doit etre apres la DDR")
        diff_days = (self.estimated_due_date - self.lmp_date).days
        if diff_days < 200 or diff_days > 320:
            raise ValueError("L'ecart DDR-DPA doit etre entre 200 et 320 jours (~28-45 SA)")
        return self


class PregnancyUpdate(BaseModel):
    """Fields that can be updated on a pregnancy."""

    actual_due_date: date | None = None
    status: str | None = None
    risk_level: str | None = None
    notes: str | None = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str | None) -> str | None:
        if v is not None and v not in ("active", "delivered", "complicated", "loss"):
            raise ValueError("Statut invalide")
        return v

    @field_validator("risk_level")
    @classmethod
    def valid_risk(cls, v: str | None) -> str | None:
        if v is not None and v not in ("low", "medium", "high", "very_high"):
            raise ValueError("Niveau de risque invalide")
        return v


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
