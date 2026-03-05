"""Dashboard endpoints for aggregate statistics."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.auth.dependencies import require_permission
from app.models.user_models import User
from app.schemas.dashboard_schemas import DashboardResponse
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permission("dashboard:read")),
):
    """Get dashboard statistics and summaries."""
    return await dashboard_service.get_dashboard(db)
