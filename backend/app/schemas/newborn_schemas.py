"""Newborn schemas for API requests and responses."""

from datetime import datetime

from pydantic import BaseModel, Field


class NewbornBase(BaseModel):
    """Base newborn fields."""

    delivery_id: int
    first_name: str | None = None
    sex: str  # M, F
    weight_g: int = Field(ge=200, le=7000)
    height_cm: float | None = None
    head_circumference_cm: float | None = None
    blood_type: str | None = None
    rh_factor: str | None = None
    apgar_1min: int | None = Field(default=None, ge=0, le=10)
    apgar_5min: int | None = Field(default=None, ge=0, le=10)
    apgar_10min: int | None = Field(default=None, ge=0, le=10)
    resuscitation_needed: bool = False
    nicu_admission: bool = False
    notes: str | None = None


class NewbornCreate(NewbornBase):
    """Fields required to create a newborn record."""

    pass


class NewbornUpdate(BaseModel):
    """Fields that can be updated on a newborn."""

    first_name: str | None = None
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
