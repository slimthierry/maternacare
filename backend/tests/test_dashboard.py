"""Tests for dashboard endpoint."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard(client: AsyncClient, auth_headers: dict):
    """Test dashboard statistics endpoint."""
    response = await client.get("/api/v1/dashboard/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "active_pregnancies" in data
    assert "upcoming_appointments" in data
    assert "current_alerts" in data
    assert "recent_deliveries" in data
    assert "risk_distribution" in data
    assert "total_patients" in data
    assert "deliveries_this_month" in data


@pytest.mark.asyncio
async def test_dashboard_unauthorized(client: AsyncClient):
    """Test dashboard without authentication."""
    response = await client.get("/api/v1/dashboard/")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test health check endpoint."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MaternaCare"
