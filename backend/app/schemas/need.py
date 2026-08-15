from datetime import datetime, timezone
from decimal import Decimal
from typing import Annotated, Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NeedBase(BaseModel):
    pass


class NeedCreate(BaseModel):
    district_id: UUID
    resource_type: str = Field(..., description="BOAT|AMBULANCE|GENERATOR|FOOD_PACKET|DRINKING_WATER")
    quantity_needed: Decimal = Field(..., gt=0)
    deadline: datetime

    @field_validator("resource_type")
    @classmethod
    def validate_resource_type(cls, v: str) -> str:
        valid = {"BOAT", "AMBULANCE", "GENERATOR", "FOOD_PACKET", "DRINKING_WATER"}
        if v not in valid:
            raise ValueError(f"Invalid resource_type. Must be one of {valid}")
        return v

    @field_validator("deadline")
    @classmethod
    def validate_deadline_future(cls, v: datetime) -> datetime:
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= now:
            raise ValueError("Deadline must be in the future")
        return v


class NeedUpdate(BaseModel):
    quantity_needed: Decimal | None = Field(None, gt=0)
    deadline: datetime | None = None
    status: str | None = Field(None, description="OPEN|PARTIALLY_MET|RESOLVED|EXPIRED")

    @field_validator("deadline")
    @classmethod
    def validate_deadline_future(cls, v: datetime | None) -> datetime | None:
        if v is None:
            return v
        now = datetime.now(timezone.utc)
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= now:
            raise ValueError("Deadline must be in the future")
        return v
        
    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v is None:
            return v
        valid = {"OPEN", "PARTIALLY_MET", "RESOLVED", "EXPIRED"}
        if v not in valid:
            raise ValueError(f"Invalid status. Must be one of {valid}")
        return v


class NeedResponse(BaseModel):
    id: UUID
    district_id: UUID
    resource_type: str
    quantity_needed: Decimal
    quantity_fulfilled: Decimal
    priority: str
    deadline: datetime
    status: str
    created_by: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NeedListResponse(BaseModel):
    items: list[NeedResponse]
    total: int
    page: int
    page_size: int

    model_config = ConfigDict(from_attributes=True)
