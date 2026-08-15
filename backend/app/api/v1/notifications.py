"""
SAHAYOG — Notification API Router.

GET /api/v1/notifications — List notifications with optional unread filter
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.notification import NotificationListResponse
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=NotificationListResponse,
    summary="List notifications",
)
async def list_notifications_endpoint(
    unread_only: bool = Query(False, description="Filter for unread notifications only"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List system notifications."""
    agency_id = current_user.agency_id if current_user.role not in ("SUPER_ADMIN", "STATE_OPERATOR") else None
    items, total = await notification_service.list_notifications(
        db, unread_only=unread_only, agency_id=agency_id, page=page, page_size=page_size
    )
    return NotificationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )
