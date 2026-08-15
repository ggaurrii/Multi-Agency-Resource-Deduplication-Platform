"""
SAHAYOG — Notification Service.

Creates alerts for shortages, duplicate deployments, or forecasting warnings.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    notification_type: str,  # DUPLICATE_DEPLOYMENT | SHORTAGE_ALERT | FORECAST_ALERT
    message: str,
    severity: str = "HIGH",  # CRITICAL | HIGH | MEDIUM | LOW
    ref_id: Optional[UUID] = None,
    ref_type: Optional[str] = None,  # resource | need | allocation
    target_agency_id: Optional[UUID] = None,
) -> Notification:
    """Create a system notification."""
    notif = Notification(
        type=notification_type,
        message=message,
        severity=severity.upper(),
        ref_id=ref_id,
        ref_type=ref_type,
        target_agency_id=target_agency_id,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif


async def list_notifications(
    db: AsyncSession,
    unread_only: bool = False,
    agency_id: Optional[UUID] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Notification], int]:
    """List system notifications with optional unread and agency filters."""
    query = select(Notification)
    if unread_only:
        query = query.where(Notification.read_at.is_(None))
    if agency_id:
        query = query.where(
            (Notification.target_agency_id == agency_id) | (Notification.target_agency_id.is_(None))
        )

    count_result = await db.execute(select(Notification.id).from_statement(query))
    total = len(count_result.scalars().all())

    query = query.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    notifications = list(result.scalars().all())

    return notifications, total
