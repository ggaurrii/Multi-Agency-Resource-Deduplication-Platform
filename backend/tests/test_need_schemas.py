from datetime import datetime, timedelta, timezone
from decimal import Decimal
import uuid

import pytest

from app.schemas.need import NeedCreate, NeedUpdate, NeedResponse


def test_need_create_valid():
    future_date = datetime.now(timezone.utc) + timedelta(days=2)
    data = {
        "district_id": uuid.uuid4(),
        "resource_type": "BOAT",
        "quantity_needed": Decimal("10.5"),
        "deadline": future_date,
    }
    schema = NeedCreate(**data)
    assert schema.resource_type == "BOAT"
    assert schema.quantity_needed == Decimal("10.5")


def test_need_create_invalid_resource_type():
    future_date = datetime.now(timezone.utc) + timedelta(days=2)
    data = {
        "district_id": uuid.uuid4(),
        "resource_type": "INVALID_TYPE",
        "quantity_needed": Decimal("10.5"),
        "deadline": future_date,
    }
    with pytest.raises(ValueError, match="Invalid resource_type"):
        NeedCreate(**data)


def test_need_create_invalid_quantity():
    future_date = datetime.now(timezone.utc) + timedelta(days=2)
    data = {
        "district_id": uuid.uuid4(),
        "resource_type": "BOAT",
        "quantity_needed": Decimal("0"),
        "deadline": future_date,
    }
    with pytest.raises(ValueError):
        NeedCreate(**data)


def test_need_create_past_deadline():
    past_date = datetime.now(timezone.utc) - timedelta(days=2)
    data = {
        "district_id": uuid.uuid4(),
        "resource_type": "BOAT",
        "quantity_needed": Decimal("10"),
        "deadline": past_date,
    }
    with pytest.raises(ValueError, match="Deadline must be in the future"):
        NeedCreate(**data)


def test_need_update_partial():
    future_date = datetime.now(timezone.utc) + timedelta(days=2)
    data = {
        "quantity_needed": Decimal("20"),
        "status": "PARTIALLY_MET"
    }
    schema = NeedUpdate(**data)
    assert schema.quantity_needed == Decimal("20")
    assert schema.deadline is None
    assert schema.status == "PARTIALLY_MET"

def test_need_update_past_deadline():
    past_date = datetime.now(timezone.utc) - timedelta(days=2)
    data = {
        "deadline": past_date
    }
    with pytest.raises(ValueError, match="Deadline must be in the future"):
        NeedUpdate(**data)


def test_need_response_serialization():
    now = datetime.now(timezone.utc)
    data = {
        "id": uuid.uuid4(),
        "district_id": uuid.uuid4(),
        "resource_type": "FOOD_PACKET",
        "quantity_needed": Decimal("100"),
        "quantity_fulfilled": Decimal("50"),
        "priority": "HIGH",
        "deadline": now + timedelta(days=1),
        "status": "PARTIALLY_MET",
        "created_by": uuid.uuid4(),
        "created_at": now,
        "updated_at": now,
    }
    schema = NeedResponse(**data)
    assert schema.resource_type == "FOOD_PACKET"
    assert schema.quantity_fulfilled == Decimal("50")
