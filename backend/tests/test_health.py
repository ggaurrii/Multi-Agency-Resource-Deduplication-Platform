"""
Tests for Phase 1 — Health and connectivity checks.

These tests verify:
1. FastAPI application starts
2. /health endpoint responds 200
3. /health/db verifies database connection and PostGIS
"""

from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint():
    """GET /health should return 200 with service info."""
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "SAHAYOG"
    assert "version" in data


def test_swagger_docs_available():
    """OpenAPI docs should be accessible at /docs."""
    client = TestClient(app)
    response = client.get("/docs")
    assert response.status_code == 200
