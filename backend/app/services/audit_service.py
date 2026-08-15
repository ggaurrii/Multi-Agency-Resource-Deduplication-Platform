"""
SAHAYOG — Audit Logging Service.

Provides immutable logging for state modifications across resources, needs, and allocations.
"""

from typing import Any, Dict, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


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
