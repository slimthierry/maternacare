"""FHIR-compatible API router for SIH integration."""

from fastapi import APIRouter

from app.libs.fhir.patient import router as patient_router
from app.libs.fhir.condition import router as condition_router
from app.libs.fhir.observation import router as observation_router
from app.libs.fhir.encounter import router as encounter_router

fhir_router = APIRouter(prefix="/api/fhir", tags=["FHIR"])

fhir_router.include_router(patient_router)
fhir_router.include_router(condition_router)
fhir_router.include_router(observation_router)
fhir_router.include_router(encounter_router)
