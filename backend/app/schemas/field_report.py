"""
SAHAYOG — FieldReport Pydantic schemas.
"""

from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

VALID_DISASTER_TYPES = {
    "FLOOD",
    "LANDSLIDE",
    "INFRASTRUCTURE_DAMAGE",
    "MEDICAL_EMERGENCY",
    "OTHER",
}

VALID_SEVERITIES = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
VALID_STATUSES = {"SUBMITTED", "VERIFIED", "RESPONDED", "RESOLVED"}


class FieldReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    disaster_type: str = Field(..., description="FLOOD|LANDSLIDE|INFRASTRUCTURE_DAMAGE|MEDICAL_EMERGENCY|OTHER")
    severity: str = Field(..., description="CRITICAL|HIGH|MEDIUM|LOW")
    district_id: UUID
    location_name: str = Field(..., min_length=2, max_length=150)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    description: str = Field(..., min_length=5)
    photo_url: Optional[str] = Field(None, max_length=500)

    @field_validator("disaster_type")
    @classmethod
    def validate_disaster_type(cls, v: str) -> str:
        v_upper = v.upper()
        if v_upper not in VALID_DISASTER_TYPES:
            raise ValueError(f"Invalid disaster_type: {v}. Must be one of {sorted(VALID_DISASTER_TYPES)}")
        return v_upper

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        v_upper = v.upper()
        if v_upper not in VALID_SEVERITIES:
            raise ValueError(f"Invalid severity: {v}. Must be one of {sorted(VALID_SEVERITIES)}")
        return v_upper


class FieldReportUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    severity: Optional[str] = None
    location_name: Optional[str] = Field(None, min_length=2, max_length=150)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
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


class FieldReportConvertToNeed(BaseModel):
    resource_type: str = Field(..., description="BOAT|AMBULANCE|GENERATOR|FOOD_PACKET|DRINKING_WATER")
    quantity_needed: Decimal = Field(..., gt=0)
    deadline: datetime = Field(..., description="Future deadline for priority derivation")


class FieldReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    disaster_type: str
    severity: str
    district_id: str
    district_name: Optional[str] = None
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    photo_url: Optional[str] = None
    status: str
    reported_by: Optional[str] = None
    reporter_name: Optional[str] = None
    linked_need_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class FieldReportListResponse(BaseModel):
    items: List[FieldReportResponse]
    total: int
    page: int
    page_size: int
