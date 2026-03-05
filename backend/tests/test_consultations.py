"""Tests for consultation management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-CONSULT-001",
        first_name="Sophie",
        last_name="Laurent",
        date_of_birth="1992-03-20",
        blood_type="O",
        rh_factor="positive",
    )
    db_session.add(patient)
    await db_session.commit()
    await db_session.refresh(patient)
    return patient


@pytest.fixture
async def test_pregnancy(db_session: AsyncSession, test_patient: Patient) -> Pregnancy:
    """Create a test pregnancy."""
    pregnancy = Pregnancy(
        patient_id=test_patient.id,
        lmp_date="2025-01-10",
        estimated_due_date="2025-10-17",
        status="active",
        risk_level="low",
        gravida=1,
        para=0,
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


@pytest.mark.asyncio
async def test_create_consultation(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a consultation record."""
    response = await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
            "weight_kg": 62.5,
            "blood_pressure_systolic": 120,
            "blood_pressure_diastolic": 75,
            "uterine_height_cm": 14.0,
            "fetal_heart_rate": 145,
            "consultation_type": "routine",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["pregnancy_id"] == test_pregnancy.id
    assert data["gestational_week"] == 14
    assert data["blood_pressure_systolic"] == 120
    assert data["consultation_type"] == "routine"


@pytest.mark.asyncio
async def test_create_consultation_with_pre_eclampsia_risk(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a consultation with high BP + proteinuria triggers pre-eclampsia alert."""
    response = await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-06-01",
            "gestational_week": 28,
            "weight_kg": 70.0,
            "blood_pressure_systolic": 155,
            "blood_pressure_diastolic": 100,
            "proteinuria": "3+",
            "consultation_type": "urgent",
        },
    )
    assert response.status_code == 201

    # Verify alert was auto-created
    alerts_response = await client.get(
        "/api/v1/alerts/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert alerts_response.status_code == 200
    alerts = alerts_response.json()["items"]
    pre_eclampsia_alerts = [a for a in alerts if a["type"] == "pre_eclampsia"]
    assert len(pre_eclampsia_alerts) >= 1
    assert pre_eclampsia_alerts[0]["severity"] == "critical"


@pytest.mark.asyncio
async def test_create_consultation_with_gestational_diabetes_risk(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a consultation with high glycemia triggers diabetes alert."""
    response = await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-05-20",
            "gestational_week": 24,
            "glycemia": 1.10,
            "consultation_type": "routine",
        },
    )
    assert response.status_code == 201

    alerts_response = await client.get(
        "/api/v1/alerts/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert alerts_response.status_code == 200
    alerts = alerts_response.json()["items"]
    diabetes_alerts = [a for a in alerts if a["type"] == "gestational_diabetes"]
    assert len(diabetes_alerts) >= 1


@pytest.mark.asyncio
async def test_list_consultations(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing consultations."""
    await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
            "consultation_type": "routine",
        },
    )

    response = await client.get("/api/v1/consultations/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_list_consultations_filter_by_pregnancy(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing consultations filtered by pregnancy_id."""
    await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
        },
    )

    response = await client.get(
        "/api/v1/consultations/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(c["pregnancy_id"] == test_pregnancy.id for c in data["items"])


@pytest.mark.asyncio
async def test_get_consultation(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test getting a consultation by ID."""
    create_response = await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
        },
    )
    consultation_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/consultations/{consultation_id}", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == consultation_id
    assert data["gestational_week"] == 14


@pytest.mark.asyncio
async def test_update_consultation(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test updating a consultation."""
    create_response = await client.post(
        "/api/v1/consultations/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
        },
    )
    consultation_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/consultations/{consultation_id}",
        headers=auth_headers,
        json={
            "notes": "RAS - Grossesse evolutive normale",
            "next_appointment": "2025-05-13",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "RAS - Grossesse evolutive normale"


@pytest.mark.asyncio
async def test_get_consultation_not_found(
    client: AsyncClient, auth_headers: dict
):
    """Test getting a non-existent consultation returns 404."""
    response = await client.get(
        "/api/v1/consultations/99999", headers=auth_headers
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_consultation_without_auth(client: AsyncClient, test_pregnancy: Pregnancy):
    """Test creating a consultation without authentication returns 401."""
    response = await client.post(
        "/api/v1/consultations/",
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-15",
            "gestational_week": 14,
        },
    )
    assert response.status_code in (401, 403)
