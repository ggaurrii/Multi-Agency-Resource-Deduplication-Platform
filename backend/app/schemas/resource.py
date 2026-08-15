from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator, computed_field


ResourceType = Literal["BOAT", "AMBULANCE", "GENERATOR", "FOOD_PACKET", "DRINKING_WATER"]


class ResourceBase(BaseModel):
    agency_id: UUID
    district_id: UUID
    resource_type: ResourceType
    quantity_total: Decimal = Field(gt=0)
    quantity_available: Decimal = Field(ge=0)
    unit: str
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: str = "AVAILABLE"
    expiry: Optional[datetime] = None


class ResourceCreate(ResourceBase):
    @model_validator(mode='after')
    def validate_quantities(self) -> 'ResourceCreate':
        if self.quantity_available > self.quantity_total:
            raise ValueError("quantity_available cannot be greater than quantity_total")
        return self


class ResourceUpdate(BaseModel):
    agency_id: Optional[UUID] = None
    district_id: Optional[UUID] = None
    resource_type: Optional[ResourceType] = None
    quantity_total: Optional[Decimal] = Field(None, gt=0)
    quantity_available: Optional[Decimal] = Field(None, ge=0)
    unit: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    status: Optional[str] = None
    expiry: Optional[datetime] = None

    @model_validator(mode='after')
    def validate_quantities(self) -> 'ResourceUpdate':
        if self.quantity_available is not None and self.quantity_total is not None:
            if self.quantity_available > self.quantity_total:
                raise ValueError("quantity_available cannot be greater than quantity_total")
        return self


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    agency_id: UUID
    district_id: UUID
    resource_type: str
    quantity_total: Decimal
    quantity_available: Decimal
    quantity_reserved: Decimal
    quantity_in_transit: Decimal
    unit: str
    status: str
    expiry: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    @computed_field
    def fulfillment_pct(self) -> float:
        if self.quantity_total > 0:
            return float((self.quantity_total - self.quantity_available) / self.quantity_total * 100)
        return 0.0


class ResourceListResponse(BaseModel):
    items: List[ResourceResponse]
    total: int
    page: int
    page_size: int


class AgencyResourceBreakdown(BaseModel):
    agency_id: UUID
    agency_name: str
    quantity: float


class PooledResourceResponse(BaseModel):
    district_id: UUID
    resource_type: str
    total_available_quantity: float
    unit: str
    agency_breakdown: List[AgencyResourceBreakdown]
