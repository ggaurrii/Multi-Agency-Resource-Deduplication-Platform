from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.algorithms.priority import classify_priority
from app.models.need import Need
from app.models.user import User
from app.schemas.need import NeedCreate, NeedUpdate


async def list_needs(
    db: AsyncSession, filters: dict[str, Any], page: int = 1, page_size: int = 20
) -> tuple[list[Need], int]:
    stmt = select(Need)
    
    if filters.get("district_id"):
        stmt = stmt.where(Need.district_id == filters["district_id"])
    if filters.get("resource_type"):
        stmt = stmt.where(Need.resource_type == filters["resource_type"])
    if filters.get("status"):
        stmt = stmt.where(Need.status == filters["status"])
    if filters.get("priority"):
        stmt = stmt.where(Need.priority == filters["priority"])

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_count = await db.scalar(count_stmt) or 0

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(stmt)
    items = list(result.scalars().all())

    return items, total_count


async def get_need(db: AsyncSession, need_id: UUID) -> Need | None:
    stmt = select(Need).where(Need.id == need_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_need(db: AsyncSession, data: NeedCreate, user: User) -> Need:
    priority = classify_priority(data.deadline)
    
    need = Need(
        district_id=data.district_id,
        resource_type=data.resource_type,
        quantity_needed=data.quantity_needed,
        quantity_fulfilled=0,
        priority=priority,
        deadline=data.deadline,
        status="OPEN",
        created_by=user.id,
    )
    db.add(need)
    await db.commit()
    await db.refresh(need)

    # Operational events: Notification & Audit Logging
    from app.services.audit_service import log_action
    from app.services.notification_service import create_notification

    await log_action(
        db,
        user_id=user.id,
        action="CREATE",
        entity="need",
        entity_id=need.id,
        after_state={
            "resource_type": need.resource_type,
            "quantity_needed": float(need.quantity_needed),
            "priority": need.priority,
            "status": need.status,
        },
    )

    if priority == "CRITICAL":
        await create_notification(
            db,
            notification_type="CRITICAL_NEED",
            message=f"CRITICAL REQUIREMENT: {need.quantity_needed} {need.resource_type} needed immediately",
            severity="CRITICAL",
            ref_id=need.id,
            ref_type="need",
        )

    return need


async def update_need(db: AsyncSession, need_id: UUID, data: NeedUpdate, user: User) -> Need | None:
    need = await get_need(db, need_id)
    if not need:
        return None

    update_data = data.model_dump(exclude_unset=True)
    
    if "deadline" in update_data:
        need.deadline = update_data["deadline"]
        need.priority = classify_priority(need.deadline)

    if "quantity_needed" in update_data:
        need.quantity_needed = update_data["quantity_needed"]
        
    if "status" in update_data:
        need.status = update_data["status"]
        
    # Auto status transition based on fulfillment
    if need.quantity_fulfilled > 0 and need.quantity_fulfilled < need.quantity_needed:
        if need.status == "OPEN":
            need.status = "PARTIALLY_MET"
    elif need.quantity_fulfilled >= need.quantity_needed:
        need.status = "RESOLVED"
        
    await db.commit()
    await db.refresh(need)
    return need
