"""Newborn schemas for API requests and responses."""

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class NewbornBase(BaseModel):
    """Base newborn fields."""

    delivery_id: int
    first_name: str | None = Field(default=None, max_length=100)
    sex: str
    weight_g: int = Field(ge=200, le=7000)
    height_cm: float | None = Field(default=None, ge=20, le=65)
    head_circumference_cm: float | None = Field(default=None, ge=20, le=45)
    blood_type: str | None = None
    rh_factor: str | None = None
    apgar_1min: int | None = Field(default=None, ge=0, le=10)
    apgar_5min: int | None = Field(default=None, ge=0, le=10)
    apgar_10min: int | None = Field(default=None, ge=0, le=10)
    resuscitation_needed: bool = False
    nicu_admission: bool = False
    notes: str | None = None

    @field_validator("sex")
    @classmethod
    def valid_sex(cls, v: str) -> str:
        if v not in ("M", "F"):
            raise ValueError("Sexe invalide (M ou F)")
        return v

    @field_validator("blood_type")
    @classmethod
    def valid_blood_type(cls, v: str | None) -> str | None:
        if v is not None and v not in ("A", "B", "AB", "O"):
            raise ValueError("Groupe sanguin invalide (A, B, AB, O)")
        return v

    @field_validator("rh_factor")
    @classmethod
    def valid_rh_factor(cls, v: str | None) -> str | None:
        if v is not None and v not in ("positive", "negative"):
            raise ValueError("Rhesus invalide (positive, negative)")
        return v


class NewbornCreate(NewbornBase):
    """Fields required to create a newborn record."""

    pass


class NewbornUpdate(BaseModel):
    """Fields that can be updated on a newborn."""

    first_name: str | None = Field(default=None, max_length=100)
    blood_type: str | None = None
    rh_factor: str | None = None
    apgar_10min: int | None = Field(default=None, ge=0, le=10)
    nicu_admission: bool | None = None
    notes: str | None = None


class NewbornResponse(NewbornBase):
    """Newborn response with all fields."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class NewbornListResponse(BaseModel):
    """Paginated list of newborns."""

    items: list[NewbornResponse]
    total: int
    page: int
    page_size: int
