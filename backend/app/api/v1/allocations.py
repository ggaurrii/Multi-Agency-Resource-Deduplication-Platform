"""
SAHAYOG — Allocation API Endpoints.

POST /api/v1/allocations/match/{need_id} — Run greedy matching engine -> PROPOSED allocation
GET  /api/v1/allocations           — List allocations
GET  /api/v1/allocations/{id}       — Get single allocation
POST /api/v1/allocations/{id}/authorize — Authorize allocation (STATE_OPERATOR / SUPER_ADMIN)
POST /api/v1/allocations/{id}/reject    — Reject allocation (STATE_OPERATOR / SUPER_ADMIN)
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.algorithms.matching import GreedyMatchingEngine
from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.allocation import (
    AllocationListResponse,
    AllocationResponse,
)
from app.services import allocation_service

router = APIRouter(prefix="/allocations", tags=["Allocations"])


@router.post(
    "/match/{need_id}",
    response_model=AllocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Trigger resource matching engine",
    description="Matches available resources to a need and creates a PROPOSED allocation.",
)
async def match_need_endpoint(
    need_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger greedy matching algorithm for a specified need."""
    return await GreedyMatchingEngine.match_need(db, need_id)


@router.get(
    "",
    response_model=AllocationListResponse,
    summary="List allocations",
    description="Retrieve allocations filtered by need_id or status.",
)
async def list_allocations_endpoint(
    need_id: Optional[UUID] = Query(None, description="Filter by need ID"),
    allocation_status: Optional[str] = Query(None, alias="status", description="Filter by status (PROPOSED|ACCEPTED|MODIFIED|REJECTED)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List allocations with optional filters."""
    items, total = await allocation_service.list_allocations(
        db, need_id=need_id, allocation_status=allocation_status, page=page, page_size=page_size
    )
    return AllocationListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{allocation_id}",
    response_model=AllocationResponse,
    summary="Get allocation by ID",
)
async def get_allocation_endpoint(
    allocation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single allocation record."""
    allocation = await allocation_service.get_allocation(db, allocation_id)
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ALLOCATION_NOT_FOUND", "message": f"Allocation {allocation_id} not found"}},
        )
    return allocation


@router.post(
    "/{allocation_id}/authorize",
    response_model=AllocationResponse,
    summary="Authorize allocation",
    description="Accepts a proposed allocation and transitions resources to IN_TRANSIT (STATE_OPERATOR / SUPER_ADMIN).",
)
async def authorize_allocation_endpoint(
    allocation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("STATE_OPERATOR", "SUPER_ADMIN")),
):
    """Authorize allocation."""
    return await allocation_service.authorize_allocation(db, allocation_id, current_user)


@router.post(
    "/{allocation_id}/reject",
    response_model=AllocationResponse,
    summary="Reject allocation",
    description="Rejects a proposed allocation and restores resource availability (STATE_OPERATOR / SUPER_ADMIN).",
)
async def reject_allocation_endpoint(
    allocation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("STATE_OPERATOR", "SUPER_ADMIN")),
):
    """Reject allocation."""
    return await allocation_service.reject_allocation(db, allocation_id, current_user)
