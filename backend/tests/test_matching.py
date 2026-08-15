"""
SAHAYOG — Unit tests for Allocation Schemas and Matching Engine logic.
"""

from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from app.schemas.allocation import AllocationItemResponse, AllocationResponse


def test_allocation_item_response_schema():
    item_id = uuid4()
    alloc_id = uuid4()
    res_id = uuid4()
    now = datetime.now(timezone.utc)

    item = AllocationItemResponse(
        id=item_id,
        allocation_id=alloc_id,
        resource_id=res_id,
        quantity_allocated=Decimal("10.0"),
        distance_km=Decimal("5.25"),
        created_at=now,
    )

    assert item.id == item_id
    assert item.quantity_allocated == Decimal("10.0")
    assert item.distance_km == Decimal("5.25")


def test_allocation_response_schema():
    alloc_id = uuid4()
    need_id = uuid4()
    now = datetime.now(timezone.utc)

    response = AllocationResponse(
        id=alloc_id,
        need_id=need_id,
        status="PROPOSED",
        created_at=now,
        updated_at=now,
        items=[],
    )

    assert response.id == alloc_id
    assert response.status == "PROPOSED"
    assert response.authorized_by is None
    assert len(response.items) == 0
