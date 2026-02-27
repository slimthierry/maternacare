"""Audit trail endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.core.dependencies import require_permission
from app.models.user_models import User
from app.schemas.audit_schemas import AuditLogListResponse
from app.services import audit_service

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/", response_model=AuditLogListResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: int | None = None,
    entity_type: str | None = None,
    action: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("audit:read")),
):
    """List audit log entries with filters and pagination."""
    return await audit_service.list_audit_logs(
        db, page, page_size, user_id, entity_type, action
    )
