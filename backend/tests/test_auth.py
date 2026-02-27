"""Tests for authentication endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    """Test user registration."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "gynecologue@maternacare.test",
            "password": "secure123",
            "name": "Dr. Martin",
            "role": "gynecologue",
            "service": "Obstetrique",
            "rpps_number": "12345678901",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "gynecologue@maternacare.test"
    assert data["role"] == "gynecologue"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    """Test that duplicate email registration fails."""
    user_data = {
        "email": "duplicate@maternacare.test",
        "password": "secure123",
        "name": "Dr. Dupont",
        "role": "sage_femme",
    }
    await client.post("/api/v1/auth/register", json=user_data)
    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login."""
    # Register first
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "login@maternacare.test",
            "password": "secure123",
            "name": "Dr. Test",
            "role": "admin",
        },
    )

    # Login
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@maternacare.test", "password": "secure123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@maternacare.test", "password": "wrong"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers: dict):
    """Test getting current user profile."""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@maternacare.test"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    """Test getting profile without token."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403
