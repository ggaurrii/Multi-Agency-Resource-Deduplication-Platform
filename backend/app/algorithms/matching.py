"""
SAHAYOG — Greedy Matching Engine.

Finds candidate resources for a need, sorts by proximity/availability,
and greedily allocates quantity up to need requirements.

CRITICAL INVARIANT:
Transitions allocated quantity from quantity_available -> quantity_reserved transactionally.
"""

from decimal import Decimal
from math import sqrt
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.allocation import Allocation, AllocationItem
from app.models.district import District
from app.models.need import Need
from app.models.resource import Resource


def compute_distance(res: Resource, dist: District) -> float:
    """Compute approximate distance between resource and district centroid."""
    if dist and dist.centroid_lat is not None and dist.centroid_lng is not None:
        # Simple Euclidean approximation for ranking
        # (In real deployment with PostGIS, ST_Distance is used via spatial query)
        res_lat = getattr(res, 'lat', None) or dist.centroid_lat
        res_lng = getattr(res, 'lng', None) or dist.centroid_lng
        return sqrt((res_lat - dist.centroid_lat)**2 + (res_lng - dist.centroid_lng)**2) * 111.0
    return 0.0


class GreedyMatchingEngine:
    """Greedy matching engine for disaster-relief resource allocation."""

    @staticmethod
    async def match_need(db: AsyncSession, need_id: UUID) -> Allocation:
        """
        Match an open Need against available Resources.

        Workflow:
        1. Fetch Need by need_id.
        2. Calculate remaining quantity needed: need.quantity_needed - need.quantity_fulfilled.
        3. If remaining <= 0 or status == 'RESOLVED', raise 400.
        4. Query available candidate resources matching need.resource_type with quantity_available > 0.
        5. Greedily allocate: quantity_available -> quantity_reserved.
        6. Create PROPOSED Allocation with child AllocationItem rows.
        7. Commit transaction and return Allocation.
        """
        result = await db.execute(select(Need).where(Need.id == need_id))
        need = result.scalar_one_or_none()

        if not need:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": {"code": "NEED_NOT_FOUND", "message": f"Need {need_id} not found"}},
            )

        remaining_needed = Decimal(str(need.quantity_needed)) - Decimal(str(need.quantity_fulfilled))
        if remaining_needed <= 0 or need.status == "RESOLVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": {"code": "NEED_ALREADY_FULFILLED", "message": "Need is already fully met or resolved"}},
            )

        # Get district centroid for distance calculation
        dist_res = await db.execute(select(District).where(District.id == need.district_id))
        district = dist_res.scalar_one_or_none()

        # Find matching resources with status='AVAILABLE' and quantity_available > 0
        res_query = (
            select(Resource)
            .where(
                Resource.resource_type == need.resource_type,
                Resource.status == "AVAILABLE",
                Resource.quantity_available > 0,
            )
            .with_for_update()  # Lock rows for transactional update
        )
        resources_result = await db.execute(res_query)
        candidate_resources = list(resources_result.scalars().all())

        if not candidate_resources:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": {"code": "NO_MATCHING_RESOURCES", "message": f"No available resources found for resource type '{need.resource_type}'"}},
            )

        # Sort candidate resources by distance to district centroid, then highest available quantity
        candidate_resources.sort(key=lambda r: (compute_distance(r, district), -float(r.quantity_available)))

        # Create proposed Allocation master record
        allocation = Allocation(need_id=need.id, status="PROPOSED")
        db.add(allocation)
        await db.flush()  # Generate allocation.id

        allocation_items = []
        unmet = remaining_needed

        for resource in candidate_resources:
            if unmet <= 0:
                break

            avail = Decimal(str(resource.quantity_available))
            allocated_qty = min(avail, unmet)

            # Transactional quantity transition: AVAILABLE -> RESERVED
            resource.quantity_available = avail - allocated_qty
            resource.quantity_reserved = Decimal(str(resource.quantity_reserved)) + allocated_qty
            unmet -= allocated_qty

            dist_km = compute_distance(resource, district)

            item = AllocationItem(
                allocation_id=allocation.id,
                resource_id=resource.id,
                quantity_allocated=allocated_qty,
                distance_km=Decimal(str(round(dist_km, 2))),
            )
            db.add(item)
            allocation_items.append(item)

        await db.commit()
        await db.refresh(allocation)

        # Operational events: Notification & Audit Logging
        from app.services.audit_service import log_action
        from app.services.notification_service import create_notification

        await create_notification(
            db,
            notification_type="ALLOCATION_PROPOSED",
            message=f"Matching engine generated proposal alloc-{str(allocation.id)[:8]} matching requirement for need #{str(need.id)[:8]}",
            severity="HIGH",
            ref_id=allocation.id,
            ref_type="allocation",
        )

        await log_action(
            db,
            user_id=None,
            action="CREATE",
            entity="allocation",
            entity_id=allocation.id,
            after_state={
                "need_id": str(need.id),
                "status": allocation.status,
                "items_count": len(allocation_items),
            },
        )

        return allocation
