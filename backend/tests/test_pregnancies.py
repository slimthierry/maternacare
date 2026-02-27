"""Tests for pregnancy management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-TEST-001",
        first_name="Marie",
        last_name="Dupont",
        date_of_birth="1990-05-15",
        blood_type="A",
        rh_factor="positive",
        phone="+33612345678",
    )
    db_session.add(patient)
    await db_session.commit()
    await db_session.refresh(patient)
    return patient


@pytest.mark.asyncio
async def test_create_pregnancy(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test creating a pregnancy record."""
    response = await client.post(
        "/api/v1/pregnancies/",
        headers=auth_headers,
        json={
            "patient_id": test_patient.id,
            "lmp_date": "2025-01-15",
            "estimated_due_date": "2025-10-22",
            "gravida": 1,
            "para": 0,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["patient_id"] == test_patient.id
    assert data["status"] == "active"
    assert data["risk_level"] == "low"


@pytest.mark.asyncio
async def test_list_pregnancies(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test listing pregnancies."""
    # Create a pregnancy first
    await client.post(
        "/api/v1/pregnancies/",
        headers=auth_headers,
        json={
            "patient_id": test_patient.id,
            "lmp_date": "2025-01-15",
            "estimated_due_date": "2025-10-22",
        },
    )

    response = await client.get("/api/v1/pregnancies/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_pregnancy_detail(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test getting pregnancy detail."""
    create_response = await client.post(
        "/api/v1/pregnancies/",
        headers=auth_headers,
        json={
            "patient_id": test_patient.id,
            "lmp_date": "2025-01-15",
            "estimated_due_date": "2025-10-22",
        },
    )
    pregnancy_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/pregnancies/{pregnancy_id}", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == pregnancy_id
    assert "consultations_count" in data
    assert "alerts_count" in data


@pytest.mark.asyncio
async def test_update_pregnancy(
    client: AsyncClient, auth_headers: dict, test_patient: Patient
):
    """Test updating a pregnancy."""
    create_response = await client.post(
        "/api/v1/pregnancies/",
        headers=auth_headers,
        json={
            "patient_id": test_patient.id,
            "lmp_date": "2025-01-15",
            "estimated_due_date": "2025-10-22",
        },
    )
    pregnancy_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/pregnancies/{pregnancy_id}",
        headers=auth_headers,
        json={"risk_level": "high", "notes": "Antecedent de pre-eclampsie"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "high"
