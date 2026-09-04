"""
SAHAYOG — Audit Log API Router.

GET /api/v1/audit-logs — Read-only immutable audit log listing with pagination and filters.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.audit_log import AuditLogListResponse
from app.services import audit_service

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="List audit log entries",
    description="Retrieve immutable operational audit trail entries with user attribution and JSON snapshots.",
)
async def list_audit_logs_endpoint(
    action: Optional[str] = Query(None, description="Filter by action (CREATE|UPDATE|AUTHORIZE|REJECT)"),
    entity: Optional[str] = Query(None, description="Filter by entity (resource|need|allocation)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SUPER_ADMIN", "STATE_OPERATOR")),
):
    """List system audit logs."""
    items, total = await audit_service.list_audit_logs(
        db, action=action, entity=entity, page=page, page_size=page_size
    )
    return AuditLogListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )
