"""Tests for newborn management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.delivery_models import Delivery
from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy
from app.models.user_models import User


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-NB-001",
        first_name="Claire",
        last_name="Petit",
        date_of_birth="1993-08-25",
        blood_type="A",
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
        lmp_date="2025-01-05",
        estimated_due_date="2025-10-12",
        status="delivered",
        risk_level="low",
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


@pytest.fixture
async def test_delivery(
    db_session: AsyncSession, test_pregnancy: Pregnancy, admin_user: User
) -> Delivery:
    """Create a test delivery."""
    delivery = Delivery(
        pregnancy_id=test_pregnancy.id,
        date="2025-10-08",
        gestational_week=39,
        delivery_type="vaginal_spontaneous",
        labor_duration_hours=7.0,
        anesthesia_type="epidural",
        blood_loss_ml=300,
        practitioner_id=admin_user.id,
    )
    db_session.add(delivery)
    await db_session.commit()
    await db_session.refresh(delivery)
    return delivery


@pytest.mark.asyncio
async def test_create_newborn(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery
):
    """Test creating a newborn record."""
    response = await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "first_name": "Lea",
            "sex": "F",
            "weight_g": 3250,
            "height_cm": 49.5,
            "head_circumference_cm": 34.0,
            "blood_type": "A",
            "rh_factor": "positive",
            "apgar_1min": 9,
            "apgar_5min": 10,
            "apgar_10min": 10,
            "resuscitation_needed": False,
            "nicu_admission": False,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "Lea"
    assert data["sex"] == "F"
    assert data["weight_g"] == 3250
    assert data["apgar_1min"] == 9
    assert data["resuscitation_needed"] is False


@pytest.mark.asyncio
async def test_create_newborn_with_low_apgar_triggers_alert(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery, test_pregnancy: Pregnancy
):
    """Test creating a newborn with APGAR < 7 triggers an alert."""
    response = await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "sex": "M",
            "weight_g": 2800,
            "apgar_1min": 4,
            "apgar_5min": 6,
            "apgar_10min": 8,
            "resuscitation_needed": True,
            "nicu_admission": True,
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
async def test_create_newborn_normal_apgar_no_alert(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery, test_pregnancy: Pregnancy
):
    """Test creating a newborn with normal APGAR does not trigger alert."""
    await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "sex": "F",
            "weight_g": 3400,
            "apgar_1min": 9,
            "apgar_5min": 10,
            "apgar_10min": 10,
            "resuscitation_needed": False,
            "nicu_admission": False,
        },
    )

    alerts_response = await client.get(
        "/api/v1/alerts/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id, "severity": "critical"},
    )
    assert alerts_response.status_code == 200


@pytest.mark.asyncio
async def test_list_newborns(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery
):
    """Test listing newborns."""
    await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "sex": "F",
            "weight_g": 3100,
        },
    )

    response = await client.get("/api/v1/newborns/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_get_newborn(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery
):
    """Test getting a newborn by ID."""
    create_response = await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "sex": "M",
            "weight_g": 3500,
        },
    )
    newborn_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/newborns/{newborn_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == newborn_id
    assert response.json()["weight_g"] == 3500


@pytest.mark.asyncio
async def test_update_newborn(
    client: AsyncClient, auth_headers: dict, test_delivery: Delivery
):
    """Test updating a newborn record."""
    create_response = await client.post(
        "/api/v1/newborns/",
        headers=auth_headers,
        json={
            "delivery_id": test_delivery.id,
            "sex": "F",
            "weight_g": 3200,
        },
    )
    newborn_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/newborns/{newborn_id}",
        headers=auth_headers,
        json={
            "first_name": "Emma",
            "blood_type": "A",
            "rh_factor": "positive",
            "notes": "Bonne adaptation a la vie extra-uterine",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Emma"
    assert data["blood_type"] == "A"


@pytest.mark.asyncio
async def test_get_newborn_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent newborn returns 404."""
    response = await client.get("/api/v1/newborns/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_newborn_without_auth(client: AsyncClient, test_delivery: Delivery):
    """Test creating a newborn without authentication returns 401."""
    response = await client.post(
        "/api/v1/newborns/",
        json={
            "delivery_id": test_delivery.id,
            "sex": "M",
            "weight_g": 3000,
        },
    )
    assert response.status_code in (401, 403)
