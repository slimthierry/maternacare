"""Tests for ultrasound management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-ECHO-001",
        first_name="Camille",
        last_name="Moreau",
        date_of_birth="1988-11-08",
        blood_type="B",
        rh_factor="negative",
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
        lmp_date="2025-02-01",
        estimated_due_date="2025-11-08",
        status="active",
        risk_level="low",
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


@pytest.mark.asyncio
async def test_create_ultrasound(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating an ultrasound record."""
    response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-20",
            "gestational_week": 12,
            "type": "dating",
            "fetal_heart_rate": 160,
            "notes": "Datation confirmee",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["pregnancy_id"] == test_pregnancy.id
    assert data["type"] == "dating"
    assert data["gestational_week"] == 12


@pytest.mark.asyncio
async def test_create_morphology_ultrasound(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a morphology ultrasound with biometry data."""
    response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-06-15",
            "gestational_week": 22,
            "type": "morphology",
            "fetal_weight_g": 450,
            "biparietal_diameter_mm": 55.0,
            "femur_length_mm": 38.0,
            "abdominal_circumference_mm": 175.0,
            "amniotic_fluid_index": 14.0,
            "placenta_position": "anterieur",
            "fetal_heart_rate": 148,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "morphology"
    assert data["biparietal_diameter_mm"] == 55.0
    assert data["amniotic_fluid_index"] == 14.0


@pytest.mark.asyncio
async def test_create_ultrasound_with_iugr_risk(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating an ultrasound with low fetal weight triggers IUGR alert."""
    response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-07-20",
            "gestational_week": 28,
            "type": "growth",
            "fetal_weight_g": 500,
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
    iugr_alerts = [a for a in alerts if a["type"] == "iugr"]
    assert len(iugr_alerts) >= 1


@pytest.mark.asyncio
async def test_create_ultrasound_with_anomalies(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating an ultrasound with anomalies triggers alert."""
    response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-06-15",
            "gestational_week": 22,
            "type": "morphology",
            "anomalies_detected": ["Hygroma kystique", "Clarté nucale augmentée"],
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
    anomaly_alerts = [a for a in alerts if a["type"] == "anomaly"]
    assert len(anomaly_alerts) >= 1


@pytest.mark.asyncio
async def test_create_ultrasound_with_low_afi(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating an ultrasound with low AFI triggers oligohydramnios alert."""
    response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-08-10",
            "gestational_week": 32,
            "type": "growth",
            "amniotic_fluid_index": 3.5,
        },
    )
    assert response.status_code == 201

    alerts_response = await client.get(
        "/api/v1/alerts/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert alerts_response.status_code == 200


@pytest.mark.asyncio
async def test_list_ultrasounds(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing ultrasounds."""
    await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-20",
            "gestational_week": 12,
            "type": "dating",
        },
    )

    response = await client.get("/api/v1/ultrasounds/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_list_ultrasounds_filter_by_pregnancy(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing ultrasounds filtered by pregnancy_id."""
    await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-20",
            "gestational_week": 12,
            "type": "dating",
        },
    )

    response = await client.get(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(u["pregnancy_id"] == test_pregnancy.id for u in data["items"])


@pytest.mark.asyncio
async def test_get_ultrasound(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test getting an ultrasound by ID."""
    create_response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-20",
            "gestational_week": 12,
            "type": "dating",
        },
    )
    ultrasound_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/ultrasounds/{ultrasound_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == ultrasound_id


@pytest.mark.asyncio
async def test_update_ultrasound(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test updating an ultrasound."""
    create_response = await client.post(
        "/api/v1/ultrasounds/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-04-20",
            "gestational_week": 12,
            "type": "dating",
        },
    )
    ultrasound_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/ultrasounds/{ultrasound_id}",
        headers=auth_headers,
        json={
            "notes": "Datation confirmee, CRL 65mm",
            "fetal_weight_g": 50,
        },
    )
    assert response.status_code == 200
    assert response.json()["notes"] == "Datation confirmee, CRL 65mm"


@pytest.mark.asyncio
async def test_get_ultrasound_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent ultrasound returns 404."""
    response = await client.get("/api/v1/ultrasounds/99999", headers=auth_headers)
    assert response.status_code == 404
