"""
SAHAYOG — Audit Logging Service.

Provides immutable logging for state modifications across resources, needs, and allocations.
"""

from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.agency import Agency
from app.models.audit_log import AuditLog
from app.models.user import User


async def log_action(
    db: AsyncSession,
    user_id: Optional[UUID],
    action: str,  # CREATE | UPDATE | DELETE | AUTHORIZE | REJECT
    entity: str,  # resource | need | allocation
    entity_id: UUID,
    before_state: Optional[Dict[str, Any]] = None,
    after_state: Optional[Dict[str, Any]] = None,
) -> AuditLog:
    """Record an audit trail entry."""
    audit_entry = AuditLog(
        user_id=user_id,
        action=action.upper(),
        entity=entity.lower(),
        entity_id=entity_id,
        before_state=before_state,
        after_state=after_state,
    )
    db.add(audit_entry)
    await db.commit()
    await db.refresh(audit_entry)
    return audit_entry


async def list_audit_logs(
    db: AsyncSession,
    action: Optional[str] = None,
    entity: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[dict], int]:
    """List audit log entries with user/agency details and pagination."""
    query = select(AuditLog).options(selectinload(AuditLog.user))

    if action:
        query = query.where(AuditLog.action == action.upper())
    if entity:
        query = query.where(AuditLog.entity == entity.lower())

    count_query = select(func.count()).select_from(query.subquery())
    total_count = await db.scalar(count_query) or 0

    query = query.order_by(AuditLog.timestamp.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    logs = list(result.scalars().all())

    # Pre-fetch agencies for user lookup
    agency_map = {}
    agency_result = await db.execute(select(Agency))
    for ag in agency_result.scalars().all():
        agency_map[ag.id] = ag.name

    items = []
    for item in logs:
        user_name = item.user.name if item.user else "System Operation"
        user_role = item.user.role if item.user else "SYSTEM"
        agency_name = agency_map.get(item.user.agency_id, "Command Center") if item.user and item.user.agency_id else "Rajasthan State Disaster Management Authority"
        
        ent_str = str(item.entity_id)[:8] if item.entity_id else "N/A"
        summary = f"{item.action} action on {item.entity} #{ent_str}"
        if item.after_state and isinstance(item.after_state, dict):
            if "status" in item.after_state:
                summary += f" — status: {item.after_state['status']}"

        items.append({
            "id": item.id,
            "user_id": item.user_id,
            "user_name": user_name,
            "user_role": user_role,
            "agency_name": agency_name,
            "action": item.action,
            "entity": item.entity,
            "entity_id": item.entity_id,
            "change_summary": summary,
            "before_state": item.before_state,
            "after_state": item.after_state,
            "timestamp": item.timestamp,
        })

    return items, total_count
