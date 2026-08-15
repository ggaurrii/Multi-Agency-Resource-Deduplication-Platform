"""
SAHAYOG — Allocation Service.

Handles listing, authorization, and rejection of allocations.

QUANTITY WORKFLOW INVARIANTS:
Authorization: quantity_reserved -> quantity_in_transit, update need.quantity_fulfilled
Rejection: quantity_reserved -> quantity_available (restores availability)
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation
from app.models.need import Need
from app.models.resource import Resource
from app.models.user import User


async def list_allocations(
    db: AsyncSession,
    need_id: Optional[UUID] = None,
    allocation_status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Allocation], int]:
    """List allocations with optional filters and pagination."""
    query = select(Allocation)
    if need_id:
        query = query.where(Allocation.need_id == need_id)
    if allocation_status:
        query = query.where(Allocation.status == allocation_status)

    count_result = await db.execute(select(Allocation.id).from_statement(query))
    total = len(count_result.scalars().all())

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    allocations = list(result.scalars().all())

    return allocations, total


async def get_allocation(db: AsyncSession, allocation_id: UUID) -> Allocation | None:
    """Get a single allocation by ID."""
    result = await db.execute(select(Allocation).where(Allocation.id == allocation_id))
    return result.scalar_one_or_none()


async def authorize_allocation(db: AsyncSession, allocation_id: UUID, user: User) -> Allocation:
    """
    Authorize a PROPOSED allocation (STATE_OPERATOR or SUPER_ADMIN).

    Workflow:
    1. Verify allocation exists and status == 'PROPOSED'.
    2. Update allocation status to 'ACCEPTED', authorized_by = user.id, authorized_at = now().
    3. For each AllocationItem, transition resource quantity: quantity_reserved -> quantity_in_transit.
    4. Update Need: quantity_fulfilled += sum(allocated_qty).
       Update Need status: PARTIALLY_MET or RESOLVED.
    5. Commit transaction.
    """
    allocation = await get_allocation(db, allocation_id)
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ALLOCATION_NOT_FOUND", "message": f"Allocation {allocation_id} not found"}},
        )

    if allocation.status != "PROPOSED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_ALLOCATION_STATE", "message": f"Cannot authorize allocation in status '{allocation.status}'. Must be PROPOSED."}},
        )

    now = datetime.now(timezone.utc)
    allocation.status = "ACCEPTED"
    allocation.authorized_by = user.id
    allocation.authorized_at = now

    total_allocated_for_need = Decimal("0")

    for item in allocation.items:
        qty = Decimal(str(item.quantity_allocated))
        total_allocated_for_need += qty

        # Lock resource row
        res_result = await db.execute(select(Resource).where(Resource.id == item.resource_id).with_for_update())
        resource = res_result.scalar_one_or_none()

        if resource:
            # Transition: RESERVED -> IN_TRANSIT
            resource.quantity_reserved = max(Decimal("0"), Decimal(str(resource.quantity_reserved)) - qty)
            resource.quantity_in_transit = Decimal(str(resource.quantity_in_transit)) + qty

    # Update associated Need
    need_result = await db.execute(select(Need).where(Need.id == allocation.need_id).with_for_update())
    need = need_result.scalar_one_or_none()

    if need:
        need.quantity_fulfilled = Decimal(str(need.quantity_fulfilled)) + total_allocated_for_need
        if need.quantity_fulfilled >= need.quantity_needed:
            need.status = "RESOLVED"
        elif need.quantity_fulfilled > 0:
            need.status = "PARTIALLY_MET"

    await db.commit()
    await db.refresh(allocation)
    return allocation


async def reject_allocation(db: AsyncSession, allocation_id: UUID, user: User) -> Allocation:
    """
    Reject a PROPOSED allocation (STATE_OPERATOR or SUPER_ADMIN).

    Workflow:
    1. Verify allocation exists and status == 'PROPOSED'.
    2. Update allocation status to 'REJECTED'.
    3. For each AllocationItem, transition resource quantity: quantity_reserved -> quantity_available.
    4. Commit transaction.
    """
    allocation = await get_allocation(db, allocation_id)
    if not allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": {"code": "ALLOCATION_NOT_FOUND", "message": f"Allocation {allocation_id} not found"}},
        )

    if allocation.status != "PROPOSED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": {"code": "INVALID_ALLOCATION_STATE", "message": f"Cannot reject allocation in status '{allocation.status}'. Must be PROPOSED."}},
        )

    allocation.status = "REJECTED"

    for item in allocation.items:
        qty = Decimal(str(item.quantity_allocated))

        # Lock resource row
        res_result = await db.execute(select(Resource).where(Resource.id == item.resource_id).with_for_update())
        resource = res_result.scalar_one_or_none()

        if resource:
            # Transition: RESERVED -> AVAILABLE (restore availability)
            resource.quantity_reserved = max(Decimal("0"), Decimal(str(resource.quantity_reserved)) - qty)
            resource.quantity_available = Decimal(str(resource.quantity_available)) + qty

    await db.commit()
    await db.refresh(allocation)
    return allocation
