"""
SAHAYOG — Unit tests for FieldReport schemas and validations.
"""

from datetime import datetime, timedelta, timezone
from uuid import uuid4
import pytest
from pydantic import ValidationError

from app.schemas.field_report import (
    FieldReportCreate,
    FieldReportUpdate,
    FieldReportConvertToNeed,
    FieldReportResponse,
)


def test_field_report_create_valid():
    payload = {
        "title": "Flood Water Inundation Sector 4",
        "disaster_type": "FLOOD",
        "severity": "CRITICAL",
        "district_id": str(uuid4()),
        "location_name": "Kota Barrage Downstream",
        "latitude": 25.2138,
        "longitude": 75.8648,
        "description": "Rising floodwaters threatening 50 homes.",
        "photo_url": "https://example.com/photo.jpg",
    }
    schema = FieldReportCreate(**payload)
    assert schema.title == "Flood Water Inundation Sector 4"
    assert schema.disaster_type == "FLOOD"
    assert schema.severity == "CRITICAL"


def test_field_report_create_invalid_disaster_type():
    payload = {
        "title": "Invalid Event",
        "disaster_type": "VOLCANO",  # Invalid type
        "severity": "HIGH",
        "district_id": str(uuid4()),
        "location_name": "Somewhere",
        "description": "Invalid event description.",
    }
    with pytest.raises(ValidationError) as exc_info:
        FieldReportCreate(**payload)
    assert "Invalid disaster_type" in str(exc_info.value)


def test_field_report_create_invalid_severity():
    payload = {
        "title": "Invalid Severity Event",
        "disaster_type": "FLOOD",
        "severity": "EXTREME",  # Invalid severity
        "district_id": str(uuid4()),
        "location_name": "Somewhere",
        "description": "Invalid severity description.",
    }
    with pytest.raises(ValidationError) as exc_info:
        FieldReportCreate(**payload)
    assert "Invalid severity" in str(exc_info.value)


def test_field_report_update_partial():
    update_data = {"status": "VERIFIED", "severity": "CRITICAL"}
    schema = FieldReportUpdate(**update_data)
    assert schema.status == "VERIFIED"
    assert schema.severity == "CRITICAL"


def test_field_report_convert_to_need_schema():
    deadline = datetime.now(timezone.utc) + timedelta(hours=5)
    convert_data = {
        "resource_type": "BOAT",
        "quantity_needed": 10,
        "deadline": deadline.isoformat(),
    }
    schema = FieldReportConvertToNeed(**convert_data)
    assert schema.resource_type == "BOAT"
    assert schema.quantity_needed == 10
