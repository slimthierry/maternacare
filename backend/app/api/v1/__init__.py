"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.pregnancies import router as pregnancies_router
from app.api.v1.consultations import router as consultations_router
from app.api.v1.ultrasounds import router as ultrasounds_router
from app.api.v1.deliveries import router as deliveries_router
from app.api.v1.postpartum import router as postpartum_router
from app.api.v1.newborns import router as newborns_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.audit import router as audit_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(pregnancies_router)
api_v1_router.include_router(consultations_router)
api_v1_router.include_router(ultrasounds_router)
api_v1_router.include_router(deliveries_router)
api_v1_router.include_router(postpartum_router)
api_v1_router.include_router(newborns_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(audit_router)
