"""Application route aggregation."""

from fastapi import APIRouter

from app.controllers.auth import router as auth_router
from app.controllers.patients import router as patients_router
from app.controllers.pregnancies import router as pregnancies_router
from app.controllers.consultations import router as consultations_router
from app.controllers.ultrasounds import router as ultrasounds_router
from app.controllers.deliveries import router as deliveries_router
from app.controllers.postpartum import router as postpartum_router
from app.controllers.newborns import router as newborns_router
from app.controllers.alerts import router as alerts_router
from app.controllers.dashboard import router as dashboard_router
from app.controllers.audit import router as audit_router
from app.routes.fhir import fhir_router

# API v1 router
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

# Main application router
app_router = APIRouter()
app_router.include_router(api_v1_router)
app_router.include_router(fhir_router)
