"""Tests for FHIR-compatible API endpoints."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient for FHIR tests."""
    patient = Patient(
        ipp="IPP-FHIR-001",
        first_name="Nathalie",
        last_name="Lefebvre",
        date_of_birth="1985-06-10",
        blood_type="O",
        rh_factor="negative",
    )
    db_session.add(patient)
    await db_session.commit()
    await db_session.refresh(patient)
    return patient


@pytest.fixture
async def test_patient_2(db_session: AsyncSession) -> Patient:
    """Create a second test patient."""
    patient = Patient(
        ipp="IPP-FHIR-002",
        first_name="Aurelie",
        last_name="Lefevre",
        date_of_birth="1990-02-28",
        blood_type="AB",
        rh_factor="positive",
    )
    db_session.add(patient)
    await db_session.commit()
    await db_session.refresh(patient)
    return patient


@pytest.fixture
async def test_pregnancy(db_session: AsyncSession, test_patient: Patient) -> Pregnancy:
    """Create a test pregnancy for condition tests."""
    pregnancy = Pregnancy(
        patient_id=test_patient.id,
        lmp_date="2025-03-01",
        estimated_due_date="2025-12-06",
        status="active",
        risk_level="medium",
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


# --- FHIR Patient endpoint tests ---


@pytest.mark.asyncio
async def test_get_fhir_patient_by_ipp(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test getting a FHIR Patient resource by IPP."""
    response = await client.get(
        f"/api/fhir/Patient/{test_patient.ipp}", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Patient"
    assert data["id"] == str(test_patient.id)
    assert data["gender"] == "female"
    assert data["birthDate"] == str(test_patient.date_of_birth)
    assert data["name"][0]["family"] == "Lefebvre"
    assert test_patient.first_name in data["name"][0]["given"]
    assert data["identifier"][0]["value"] == test_patient.ipp


@pytest.mark.asyncio
async def test_get_fhir_patient_not_found(
    client: AsyncClient, auth_headers: dict
):
    """Test getting a non-existent FHIR Patient returns 404."""
    response = await client.get(
        "/api/fhir/Patient/IPP-NONEXISTENT", headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_search_fhir_patients(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test searching FHIR Patient resources."""
    response = await client.get(
        "/api/fhir/Patient/", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["resourceType"] == "Bundle"
    assert data["type"] == "searchset"
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_search_fhir_patients_by_name(
    client: AsyncClient, auth_headers: dict, test_patient: Patient, test_patient_2: Patient
):
    """Test searching FHIR Patient resources by name."""
    response = await client.get(
        "/api/fhir/Patient/",
        headers=auth_headers,
        params={"name": "Lefebvre"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_search_fhir_patients_by_identifier(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test searching FHIR Patient resources by IPP identifier."""
    response = await client.get(
        "/api/fhir/Patient/",
        headers=auth_headers,
        params={"identifier": test_patient.ipp},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["entry"][0]["resource"]["identifier"][0]["value"] == test_patient.ipp


@pytest.mark.asyncio
async def test_search_fhir_patients_no_results(
    client: AsyncClient, auth_headers: dict
):
    """Test searching FHIR Patient resources with no match."""
    response = await client.get(
        "/api/fhir/Patient/",
        headers=auth_headers,
        params={"name": "NonExistentName12345"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["entry"] == []


@pytest.mark.asyncio
async def test_fhir_patient_without_auth(client: AsyncClient, test_patient: Patient):
    """Test FHIR Patient endpoints require authentication."""
    response = await client.get(
        f"/api/fhir/Patient/{test_patient.ipp}"
    )
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_fhir_patient_identifier_format(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test FHIR Patient resource identifier uses French INS-C OID."""
    response = await client.get(
        f"/api/fhir/Patient/{test_patient.ipp}", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    identifier = data["identifier"][0]
    assert identifier["system"] == "urn:oid:1.2.250.1.213.1.4.2"
    assert identifier["value"] == test_patient.ipp
