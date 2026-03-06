"""Delivery schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator


class DeliveryBase(BaseModel):
    """Base delivery fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=20, le=45)
    delivery_type: str
    labor_duration_hours: float | None = Field(default=None, ge=0, le=72)
    complications: list[str] | None = None
    anesthesia_type: str = "none"
    blood_loss_ml: int | None = Field(default=None, ge=0, le=5000)
    notes: str | None = None

    @field_validator("delivery_type")
    @classmethod
    def valid_delivery_type(cls, v: str) -> str:
        valid = ("vaginal_spontaneous", "vaginal_assisted", "cesarean_planned", "cesarean_emergency")
        if v not in valid:
            raise ValueError(f"Mode d'accouchement invalide ({', '.join(valid)})")
        return v

    @field_validator("anesthesia_type")
    @classmethod
    def valid_anesthesia(cls, v: str) -> str:
        if v not in ("none", "epidural", "spinal", "general"):
            raise ValueError("Type d'anesthesie invalide")
        return v


class DeliveryCreate(DeliveryBase):
    """Fields required to create a delivery record."""

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("La date d'accouchement ne peut pas etre dans le futur")
        return v


class DeliveryUpdate(BaseModel):
    """Fields that can be updated on a delivery."""

    labor_duration_hours: float | None = Field(default=None, ge=0, le=72)
    complications: list[str] | None = None
    blood_loss_ml: int | None = Field(default=None, ge=0, le=5000)
    notes: str | None = None


class DeliveryResponse(DeliveryBase):
    """Delivery response with all fields."""

    id: int
    practitioner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class DeliveryListResponse(BaseModel):
    """Paginated list of deliveries."""

    items: list[DeliveryResponse]
    total: int
    page: int
    page_size: int
