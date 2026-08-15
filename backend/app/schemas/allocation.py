"""
SAHAYOG — Pydantic schemas for Allocations.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AllocationItemResponse(BaseModel):
    """Allocation child item response."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    allocation_id: UUID
    resource_id: UUID
    quantity_allocated: Decimal
    distance_km: Optional[Decimal] = None
    created_at: datetime


class AllocationResponse(BaseModel):
    """Allocation master response."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    need_id: UUID
    status: str  # PROPOSED | ACCEPTED | MODIFIED | REJECTED
    authorized_by: Optional[UUID] = None
    authorized_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[AllocationItemResponse] = []


class AllocationListResponse(BaseModel):
    """Paginated allocation list wrapper."""
    items: List[AllocationResponse]
    total: int
    page: int
    page_size: int
