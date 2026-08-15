"""
SAHAYOG — Pydantic schemas for Notifications.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: str
    message: str
    severity: str
    ref_id: Optional[UUID] = None
    ref_type: Optional[str] = None
    target_agency_id: Optional[UUID] = None
    created_at: datetime
    read_at: Optional[datetime] = None


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    page_size: int
