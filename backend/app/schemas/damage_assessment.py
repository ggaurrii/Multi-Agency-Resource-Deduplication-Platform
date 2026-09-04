"""
SAHAYOG — DamageAssessment Pydantic schemas.
"""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_DAMAGE_CATEGORIES = {
    "ROAD",
    "BRIDGE",
    "HOSPITAL",
    "SCHOOL",
    "POWER_INFRASTRUCTURE",
    "WATER_INFRASTRUCTURE",
    "SHELTER",
    "RESIDENTIAL_AREA",
    "OTHER",
}

VALID_SEVERITIES = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
VALID_STATUSES = {
    "REPORTED",
    "ASSESSED",
    "PRIORITIZED",
    "RESTORATION_STARTED",
    "RESTORED",
    "VERIFIED",
}


class DamageAssessmentCreate(BaseModel):
    field_report_id: Optional[UUID] = None
    title: str = Field(..., min_length=3, max_length=150)
    district_id: UUID
    location_name: str = Field(..., min_length=2, max_length=150)
    damage_category: str = Field(..., description="ROAD|BRIDGE|HOSPITAL|SCHOOL|POWER_INFRASTRUCTURE|WATER_INFRASTRUCTURE|SHELTER|RESIDENTIAL_AREA|OTHER")
    severity: str = Field(..., description="CRITICAL|HIGH|MEDIUM|LOW")
    affected_population: Decimal = Field(..., ge=0)
    estimated_cost_inr: Optional[Decimal] = Field(None, ge=0)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    description: str = Field(..., min_length=5)
    photo_url: Optional[str] = Field(None, max_length=500)

    @field_validator("damage_category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v_upper = v.upper()
        if v_upper not in VALID_DAMAGE_CATEGORIES:
            raise ValueError(f"Invalid damage_category: {v}. Must be one of {sorted(VALID_DAMAGE_CATEGORIES)}")
        return v_upper

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        v_upper = v.upper()
        if v_upper not in VALID_SEVERITIES:
            raise ValueError(f"Invalid severity: {v}. Must be one of {sorted(VALID_SEVERITIES)}")
        return v_upper


class DamageAssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    severity: Optional[str] = None
    affected_population: Optional[Decimal] = Field(None, ge=0)
    estimated_cost_inr: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None
    photo_url: Optional[str] = None
    status: Optional[str] = None

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_upper = v.upper()
            if v_upper not in VALID_SEVERITIES:
                raise ValueError(f"Invalid severity: {v}. Must be one of {sorted(VALID_SEVERITIES)}")
            return v_upper
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_upper = v.upper()
            if v_upper not in VALID_STATUSES:
                raise ValueError(f"Invalid status: {v}. Must be one of {sorted(VALID_STATUSES)}")
            return v_upper
        return v


class DamageAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    field_report_id: Optional[str] = None
    field_report_title: Optional[str] = None
    title: str
    district_id: str
    district_name: Optional[str] = None
    location_name: str
    damage_category: str
    severity: str
    priority_level: str
    recovery_score: float
    factors: Dict[str, float] = Field(default_factory=dict)
    affected_population: Decimal
    estimated_cost_inr: Optional[Decimal] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    photo_url: Optional[str] = None
    status: str
    assessed_by: Optional[str] = None
    assessor_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class DamageAssessmentListResponse(BaseModel):
    items: List[DamageAssessmentResponse]
    total: int
    page: int
    page_size: int
    summary_metrics: Dict[str, Any] = Field(default_factory=dict)
