"""Delivery schemas for API requests and responses."""

from datetime import date, datetime

from pydantic import BaseModel, Field


class DeliveryBase(BaseModel):
    """Base delivery fields."""

    pregnancy_id: int
    date: date
    gestational_week: int = Field(ge=20, le=45)
    delivery_type: str  # vaginal_spontaneous, vaginal_assisted, cesarean_planned, cesarean_emergency
    labor_duration_hours: float | None = None
    complications: list[str] | None = None
    anesthesia_type: str = "none"  # none, epidural, spinal, general
    blood_loss_ml: int | None = None
    notes: str | None = None


class DeliveryCreate(DeliveryBase):
    """Fields required to create a delivery record."""

    pass


class DeliveryUpdate(BaseModel):
    """Fields that can be updated on a delivery."""

    labor_duration_hours: float | None = None
    complications: list[str] | None = None
    blood_loss_ml: int | None = None
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
