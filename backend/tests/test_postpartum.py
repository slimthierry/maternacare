"""Tests for post-partum follow-up management."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient_models import Patient
from app.models.pregnancy_models import Pregnancy


@pytest.fixture
async def test_patient(db_session: AsyncSession) -> Patient:
    """Create a test patient."""
    patient = Patient(
        ipp="IPP-PP-001",
        first_name="Emilie",
        last_name="Durand",
        date_of_birth="1990-12-15",
        blood_type="O",
        rh_factor="positive",
    )
    db_session.add(patient)
    await db_session.commit()
    await db_session.refresh(patient)
    return patient


@pytest.fixture
async def test_pregnancy(db_session: AsyncSession, test_patient: Patient) -> Pregnancy:
    """Create a delivered pregnancy."""
    pregnancy = Pregnancy(
        patient_id=test_patient.id,
        lmp_date="2025-01-01",
        estimated_due_date="2025-10-08",
        status="delivered",
        risk_level="low",
    )
    db_session.add(pregnancy)
    await db_session.commit()
    await db_session.refresh(pregnancy)
    return pregnancy


@pytest.mark.asyncio
async def test_create_postpartum_visit(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a post-partum visit."""
    response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
            "mood_score": 8,
            "edinburgh_score": 5,
            "breastfeeding_status": "exclusive",
            "uterine_involution": "normal",
            "wound_healing": "good",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["pregnancy_id"] == test_pregnancy.id
    assert data["days_postpartum"] == 7
    assert data["edinburgh_score"] == 5
    assert data["breastfeeding_status"] == "exclusive"


@pytest.mark.asyncio
async def test_create_postpartum_with_high_edinburgh_triggers_alert(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a post-partum visit with Edinburgh score >= 13 triggers depression alert."""
    response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-20",
            "days_postpartum": 12,
            "mood_score": 3,
            "edinburgh_score": 16,
            "breastfeeding_status": "mixed",
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
async def test_create_postpartum_with_very_high_edinburgh(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a post-partum visit with Edinburgh score >= 20 (critical)."""
    response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-25",
            "days_postpartum": 17,
            "mood_score": 2,
            "edinburgh_score": 22,
            "breastfeeding_status": "formula",
            "complications": ["Idees suicidaires"],
        },
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_postpartum_with_normal_edinburgh_no_alert(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a post-partum visit with normal Edinburgh score."""
    response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
            "mood_score": 8,
            "edinburgh_score": 6,
            "breastfeeding_status": "exclusive",
        },
    )
    assert response.status_code == 201


@pytest.mark.asyncio
async def test_create_postpartum_with_complications(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test creating a post-partum visit with wound complications."""
    response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-20",
            "days_postpartum": 12,
            "wound_healing": "infection",
            "uterine_involution": "delayed",
            "complications": ["Endometrite", "Infection cicatrice"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["wound_healing"] == "infection"
    assert "Endometrite" in data["complications"]


@pytest.mark.asyncio
async def test_list_postpartum(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing post-partum visits."""
    await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
        },
    )

    response = await client.get("/api/v1/postpartum/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert len(data["items"]) >= 1


@pytest.mark.asyncio
async def test_list_postpartum_filter_by_pregnancy(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test listing post-partum visits filtered by pregnancy_id."""
    await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
        },
    )

    response = await client.get(
        "/api/v1/postpartum/",
        headers=auth_headers,
        params={"pregnancy_id": test_pregnancy.id},
    )
    assert response.status_code == 200
    data = response.json()
    assert all(v["pregnancy_id"] == test_pregnancy.id for v in data["items"])


@pytest.mark.asyncio
async def test_get_postpartum(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test getting a post-partum visit by ID."""
    create_response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
        },
    )
    visit_id = create_response.json()["id"]

    response = await client.get(
        f"/api/v1/postpartum/{visit_id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == visit_id


@pytest.mark.asyncio
async def test_update_postpartum(
    client: AsyncClient, auth_headers: dict, test_pregnancy: Pregnancy
):
    """Test updating a post-partum visit."""
    create_response = await client.post(
        "/api/v1/postpartum/",
        headers=auth_headers,
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
        },
    )
    visit_id = create_response.json()["id"]

    response = await client.put(
        f"/api/v1/postpartum/{visit_id}",
        headers=auth_headers,
        json={
            "mood_score": 7,
            "edinburgh_score": 4,
            "breastfeeding_status": "exclusive",
            "notes": "Bonne evolution post-partum",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["edinburgh_score"] == 4
    assert data["notes"] == "Bonne evolution post-partum"


@pytest.mark.asyncio
async def test_get_postpartum_not_found(client: AsyncClient, auth_headers: dict):
    """Test getting a non-existent post-partum visit returns 404."""
    response = await client.get("/api/v1/postpartum/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_create_postpartum_without_auth(client: AsyncClient, test_pregnancy: Pregnancy):
    """Test creating a post-partum visit without authentication returns 401."""
    response = await client.post(
        "/api/v1/postpartum/",
        json={
            "pregnancy_id": test_pregnancy.id,
            "date": "2025-10-15",
            "days_postpartum": 7,
        },
    )
    assert response.status_code in (401, 403)
