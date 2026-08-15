from typing import Optional
from uuid import UUID
from decimal import Decimal
from collections import defaultdict

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.resource import Resource
from app.models.agency import Agency

async def pool_resources(
    db: AsyncSession,
    district_id: Optional[UUID] = None,
    resource_type: Optional[str] = None
) -> list[dict]:
    query = (
        select(Resource, Agency)
        .join(Agency, Resource.agency_id == Agency.id)
        .where(
            Resource.status == "AVAILABLE",
            Resource.quantity_available > 0
        )
    )
    if district_id:
        query = query.where(Resource.district_id == district_id)
    if resource_type:
        query = query.where(Resource.resource_type == resource_type)

    result = await db.execute(query)
    rows = result.all()

    grouped = defaultdict(lambda: {
        "total_available_quantity": Decimal("0.0"),
        "agency_breakdown": {},
        "unit": None
    })

    for resource, agency in rows:
        key = (resource.district_id, resource.resource_type)
        grouped[key]["total_available_quantity"] += resource.quantity_available
        if not grouped[key]["unit"]:
            grouped[key]["unit"] = resource.unit
        
        if agency.id not in grouped[key]["agency_breakdown"]:
            grouped[key]["agency_breakdown"][agency.id] = {
                "agency_id": str(agency.id),
                "agency_name": agency.name,
                "quantity": Decimal("0.0")
            }
        grouped[key]["agency_breakdown"][agency.id]["quantity"] += resource.quantity_available

    response = []
    for (d_id, r_type), data in grouped.items():
        response.append({
            "district_id": d_id,
            "resource_type": r_type,
            "total_available_quantity": float(data["total_available_quantity"]),
            "agency_breakdown": [
                {
                    "agency_id": bd["agency_id"],
                    "agency_name": bd["agency_name"],
                    "quantity": float(bd["quantity"])
                }
                for bd in data["agency_breakdown"].values()
            ],
            "unit": data["unit"]
        })
    
    return response
