"""
SAHAYOG — Unit tests for DamageAssessment schemas and recovery priority scoring engine.
"""

from uuid import uuid4
import pytest
from pydantic import ValidationError

from app.schemas.damage_assessment import (
    DamageAssessmentCreate,
    DamageAssessmentUpdate,
    DamageAssessmentResponse,
)
from app.services.damage_assessment_service import calculate_recovery_priority_score


def test_calculate_recovery_priority_score_hospital():
    score, priority_level, factors = calculate_recovery_priority_score(
        severity="CRITICAL",
        damage_category="HOSPITAL",
        affected_population=8500,
    )
    assert score >= 80.0
    assert priority_level == "IMMEDIATE"
    assert factors["infrastructureCriticalityScore"] == 95.0


def test_calculate_recovery_priority_score_minor():
    score, priority_level, factors = calculate_recovery_priority_score(
        severity="LOW",
        damage_category="OTHER",
        affected_population=50,
    )
    assert score < 50.0
    assert priority_level in ("MEDIUM", "LOW")


def test_damage_assessment_create_valid():
    payload = {
        "title": "Kota Sector 4 Primary Health Center Flood Damage",
        "district_id": str(uuid4()),
        "location_name": "Sector 4 Kota",
        "damage_category": "HOSPITAL",
        "severity": "CRITICAL",
        "affected_population": 3000,
        "estimated_cost_inr": 1500000,
        "description": "Flooded pharmacy and emergency ward.",
    }
    schema = DamageAssessmentCreate(**payload)
    assert schema.damage_category == "HOSPITAL"
    assert schema.severity == "CRITICAL"
    assert schema.affected_population == 3000


def test_damage_assessment_create_invalid_category():
    payload = {
        "title": "Invalid Category Test",
        "district_id": str(uuid4()),
        "location_name": "Somewhere",
        "damage_category": "AIRPORT",  # Invalid
        "severity": "HIGH",
        "affected_population": 500,
        "description": "Invalid category description.",
    }
    with pytest.raises(ValidationError) as exc_info:
        DamageAssessmentCreate(**payload)
    assert "Invalid damage_category" in str(exc_info.value)


def test_damage_assessment_update_status():
    update_data = {"status": "RESTORATION_STARTED", "severity": "HIGH"}
    schema = DamageAssessmentUpdate(**update_data)
    assert schema.status == "RESTORATION_STARTED"
    assert schema.severity == "HIGH"
