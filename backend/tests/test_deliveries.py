"""Tests for delivery management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-DELIV-001",
        first_name="Isabelle",
        last_name="Bernard",
        date_of_birth="1991-07-12",
        blood_type="AB",
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
        lmp_date="2025-01-01",
        estimated_due_date="2025-10-08",
        status="active",
        risk_level="low",
        gravida=2,
        para=1,
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


@pytest.mark.asyncio
async def test_create_delivery(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a delivery record."""
    response = await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
            "labor_duration_hours": 8.5,
            "anesthesia_type": "epidural",
            "blood_loss_ml": 350,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["pregnancy_id"] == test_pregnancy.id
    assert data["delivery_type"] == "vaginal_spontaneous"
    assert data["gestational_week"] == 39
    assert data["labor_duration_hours"] == 8.5
    assert data["anesthesia_type"] == "epidural"


@pytest.mark.asyncio
async def test_create_delivery_updates_pregnancy_status(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test that creating a delivery updates pregnancy status to 'delivered'."""
    await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
        },
    )

    pregnancy_response = await client.get(
        f"/api/v1/pregnancies/{test_pregnancy.id}", headers=auth_headers
    )
    assert pregnancy_response.status_code == 200
    assert pregnancy_response.json()["status"] == "delivered"


@pytest.mark.asyncio
async def test_create_cesarean_delivery(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a cesarean delivery with complications."""
    response = await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-09-28",
            "gestational_week": 38,
            "delivery_type": "cesarean_emergency",
            "complications": ["Souffrance foetale aigue", "Procidence du cordon"],
            "anesthesia_type": "general",
            "blood_loss_ml": 800,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["delivery_type"] == "cesarean_emergency"
    assert "Souffrance foetale aigue" in data["complications"]
    assert data["blood_loss_ml"] == 800


@pytest.mark.asyncio
async def test_list_deliveries(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing deliveries."""
    await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
        },
    )

    response = await client.get("/api/v1/deliveries/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_delivery(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test getting a delivery by ID."""
    create_response = await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
        },
    )
    delivery_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/deliveries/{delivery_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == delivery_id


@pytest.mark.asyncio
async def test_update_delivery(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test updating a delivery record."""
    create_response = await client.post(
        "/api/v1/deliveries/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
        },
    )
    delivery_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/deliveries/{delivery_id}",
        headers=auth_headers,
        json={
            "notes": "Accouchement sans complication",
            "blood_loss_ml": 300,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == "Accouchement sans complication"
    assert data["blood_loss_ml"] == 300


@pytest.mark.asyncio
async def test_get_delivery_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent delivery returns 404."""
    response = await client.get("/api/v1/deliveries/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_delivery_without_auth(client: AsyncClient, test_pregnancy: Pregnancy):
    """Test creating a delivery without authentication returns 401."""
    response = await client.post(
        "/api/v1/deliveries/",
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-05",
            "gestational_week": 39,
            "delivery_type": "vaginal_spontaneous",
        },
    )
    assert response.status_code in (401, 403)
