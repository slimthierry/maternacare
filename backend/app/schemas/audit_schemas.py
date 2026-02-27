"""Audit log schemas for API responses."""

from datetime import datetime

from pydantic import BaseModel


class AuditLogResponse(BaseModel):
    """Audit log entry response."""

    id: int
    user_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    details: str | None
    ip_address: str | None
    timestamp: datetime

    class Config:
        from_attributes = True


class AuditLogListResponse(BaseModel):
    """Paginated list of audit log entries."""

    items: list[AuditLogResponse]
    total: int
    page: int
    page_size: int
