"""Alert schemas for API requests and responses."""

from datetime import datetime

from pydantic import BaseModel


class AlertBase(BaseModel):
    """Base alert fields."""

    pregnancy_id: int
    type: str  # pre_eclampsia, gestational_diabetes, iugr, preterm_labor, placenta_previa, rh_incompatibility, anomaly
    severity: str  # info, warning, critical
    description: str


class AlertCreate(AlertBase):
    """Fields required to create an alert."""

    auto_generated: bool = False


class AlertAcknowledge(BaseModel):
    """Fields to acknowledge an alert."""

    pass


class AlertResolve(BaseModel):
    """Fields to resolve an alert."""

    notes: str | None = None


class AlertResponse(AlertBase):
    """Alert response with all fields."""

    id: int
    detected_at: datetime
    acknowledged_by: int | None = None
    acknowledged_at: datetime | None = None
    status: str
    auto_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AlertListResponse(BaseModel):
    """Paginated list of alerts."""

    items: list[AlertResponse]
    total: int
    page: int
    page_size: int
