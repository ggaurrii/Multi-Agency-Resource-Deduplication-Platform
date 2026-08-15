"""
SAHAYOG — Tests for Resource Deduplication / Pooling.
"""

from uuid import uuid4
from app.schemas.resource import PooledResourceResponse, AgencyResourceBreakdown


def test_pooled_resource_response_schema():
    district_id = uuid4()
    agency_id = uuid4()
    
    breakdown = AgencyResourceBreakdown(
        agency_id=agency_id,
        agency_name="NDRF Kota",
        quantity=50.0
    )
    
    pooled = PooledResourceResponse(
        district_id=district_id,
        resource_type="BOAT",
        total_available_quantity=50.0,
        unit="units",
        agency_breakdown=[breakdown]
    )
    
    assert pooled.district_id == district_id
    assert pooled.resource_type == "BOAT"
    assert pooled.total_available_quantity == 50.0
    assert len(pooled.agency_breakdown) == 1
    assert pooled.agency_breakdown[0].agency_name == "NDRF Kota"
