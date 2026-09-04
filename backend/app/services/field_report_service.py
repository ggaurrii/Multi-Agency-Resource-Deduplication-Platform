"""
SAHAYOG — FieldReport service layer.

Business logic for managing ground incident reports, notifications,
and conversion to Requisitions (Needs).
"""

import uuid
from typing import Dict, Any, List, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.field_report import FieldReport
from app.models.need import Need
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.field_report import FieldReportCreate, FieldReportUpdate, FieldReportConvertToNeed
from app.algorithms.priority import classify_priority


async def list_field_reports(
    db: AsyncSession,
    filters: Dict[str, Any],
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[FieldReport], int]:
    """List field reports with optional filters (district_id, severity, disaster_type, status)."""
    query = select(FieldReport)

    if filters.get("district_id"):
        query = query.where(FieldReport.district_id == filters["district_id"])
    if filters.get("severity"):
        query = query.where(FieldReport.severity == filters["severity"])
    if filters.get("disaster_type"):
        query = query.where(FieldReport.disaster_type == filters["disaster_type"])
    if filters.get("status"):
        query = query.where(FieldReport.status == filters["status"])

    # Count query
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar() or 0

    # Paginate and order by created_at desc
    query = query.order_by(desc(FieldReport.created_at)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = list(result.scalars().all())

    return items, total_count


async def get_field_report(db: AsyncSession, report_id: uuid.UUID) -> FieldReport | None:
    """Get a single field report by ID."""
    result = await db.execute(select(FieldReport).where(FieldReport.id == report_id))
    return result.scalar_one_or_none()


async def create_field_report(
    db: AsyncSession,
    data: FieldReportCreate,
    user: User | None = None,
) -> FieldReport:
    """Create a new ground incident field report and emit notifications for critical alerts."""
    report = FieldReport(
        title=data.title,
        disaster_type=data.disaster_type,
        severity=data.severity,
        district_id=data.district_id,
        location_name=data.location_name,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        photo_url=data.photo_url,
        status="SUBMITTED",
        reported_by=user.id if user else None,
    )
    db.add(report)
    await db.flush()

    # Emit Notification if CRITICAL or HIGH
    if data.severity in ("CRITICAL", "HIGH"):
        notif = Notification(
            type="FIELD_INCIDENT",
            ref_id=report.id,
            ref_type="field_report",
            message=f"INCIDENT ALERT [{data.severity}]: {data.title} at {data.location_name}",
            severity=data.severity,
        )
        db.add(notif)

    # Emit Audit Log
    audit = AuditLog(
        user_id=user.id if user else None,
        action="CREATE",
        entity="field_report",
        entity_id=report.id,
        after_state={
            "title": data.title,
            "disaster_type": data.disaster_type,
            "severity": data.severity,
            "status": "SUBMITTED",
        },
    )
    db.add(audit)

    await db.commit()
    await db.refresh(report)
    return report


async def update_field_report(
    db: AsyncSession,
    report_id: uuid.UUID,
    data: FieldReportUpdate,
    user: User,
) -> FieldReport:
    """Update field report status or severity."""
    report = await get_field_report(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field report not found.")

    before_state = {
        "severity": report.severity,
        "status": report.status,
        "location_name": report.location_name,
    }

    update_dict = data.model_dump(exclude_unset=True)
    old_status = report.status
    for key, value in update_dict.items():
        if value is not None:
            setattr(report, key, value)

    # Emit notification if status changed
    if data.status and data.status != old_status:
        notif = Notification(
            type="FIELD_INCIDENT_STATUS",
            ref_id=report.id,
            ref_type="field_report",
            message=f"Field Incident #{str(report.id)[:8]} status updated to {data.status}",
            severity="MEDIUM",
        )
        db.add(notif)

    # Emit Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="UPDATE",
        entity="field_report",
        entity_id=report.id,
        before_state=before_state,
        after_state=update_dict,
    )
    db.add(audit)

    await db.commit()
    await db.refresh(report)
    return report


async def convert_field_report_to_need(
    db: AsyncSession,
    report_id: uuid.UUID,
    need_data: FieldReportConvertToNeed,
    user: User,
) -> Tuple[FieldReport, Need]:
    """Convert/link a Field Incident Report directly to a Need Requisition for matching & allocation."""
    report = await get_field_report(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field report not found.")

    # Derive priority from deadline
    prio = classify_priority(need_data.deadline)

    # Create linked Need
    need = Need(
        district_id=report.district_id,
        resource_type=need_data.resource_type,
        quantity_needed=need_data.quantity_needed,
        quantity_fulfilled=0,
        priority=prio,
        deadline=need_data.deadline,
        status="OPEN",
        created_by=user.id,
    )
    db.add(need)
    await db.flush()

    # Update FieldReport with linked need ID and transition status to RESPONDED
    report.linked_need_id = need.id
    if report.status == "SUBMITTED" or report.status == "VERIFIED":
        report.status = "RESPONDED"

    # Emit Notification
    notif = Notification(
        type="CRITICAL_NEED",
        ref_id=need.id,
        ref_type="need",
        message=f"Requisition created from Incident #{str(report.id)[:8]}: {need_data.quantity_needed} {need_data.resource_type}",
        severity="HIGH",
    )
    db.add(notif)

    # Emit Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="CONVERT_TO_NEED",
        entity="field_report",
        entity_id=report.id,
        after_state={"linked_need_id": str(need.id), "status": report.status},
    )
    db.add(audit)

    await db.commit()
    await db.refresh(report)
    await db.refresh(need)
    return report, need
