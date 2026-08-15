import pytest
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timezone
from pydantic import ValidationError

from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse

def test_resource_create_valid():
    data = {
        "agency_id": uuid4(),
        "district_id": uuid4(),
        "resource_type": "BOAT",
        "quantity_total": Decimal("10"),
        "quantity_available": Decimal("10"),
        "unit": "units"
    }
    resource = ResourceCreate(**data)
    assert resource.resource_type == "BOAT"
    assert resource.quantity_total == Decimal("10")
    assert resource.quantity_available == Decimal("10")
    assert resource.unit == "units"

def test_resource_create_invalid_resource_type():
    data = {
        "agency_id": uuid4(),
        "district_id": uuid4(),
        "resource_type": "INVALID_TYPE",
        "quantity_total": Decimal("10"),
        "quantity_available": Decimal("10"),
        "unit": "units"
    }
    with pytest.raises(ValidationError):
        ResourceCreate(**data)

def test_resource_create_negative_quantity():
    data = {
        "agency_id": uuid4(),
        "district_id": uuid4(),
        "resource_type": "BOAT",
        "quantity_total": Decimal("-10"),
        "quantity_available": Decimal("-10"),
        "unit": "units"
    }
    with pytest.raises(ValidationError):
        ResourceCreate(**data)

def test_resource_create_available_greater_than_total():
    data = {
        "agency_id": uuid4(),
        "district_id": uuid4(),
        "resource_type": "BOAT",
        "quantity_total": Decimal("10"),
        "quantity_available": Decimal("15"),
        "unit": "units"
    }
    with pytest.raises(ValidationError) as exc:
        ResourceCreate(**data)
    assert "quantity_available cannot be greater than quantity_total" in str(exc.value)

def test_resource_update_partial_data():
    data = {
        "quantity_available": Decimal("5")
    }
    update = ResourceUpdate(**data)
    assert update.quantity_available == Decimal("5")
    assert update.resource_type is None

def test_resource_update_available_greater_than_total():
    data = {
        "quantity_total": Decimal("10"),
        "quantity_available": Decimal("15")
    }
    with pytest.raises(ValidationError) as exc:
        ResourceUpdate(**data)
    assert "quantity_available cannot be greater than quantity_total" in str(exc.value)

def test_resource_response_serialization():
    # We will simulate a database model object
    class MockResource:
        id = uuid4()
        agency_id = uuid4()
        district_id = uuid4()
        resource_type = "BOAT"
        quantity_total = Decimal("10")
        quantity_available = Decimal("6")
        quantity_reserved = Decimal("2")
        quantity_in_transit = Decimal("2")
        unit = "units"
        status = "AVAILABLE"
        expiry = None
        created_at = datetime.now(timezone.utc)
        updated_at = datetime.now(timezone.utc)

    mock_obj = MockResource()
    response = ResourceResponse.model_validate(mock_obj)
    
    assert response.id == mock_obj.id
    assert response.quantity_total == Decimal("10")
    assert response.fulfillment_pct == 40.0  # (10 - 6) / 10 * 100
