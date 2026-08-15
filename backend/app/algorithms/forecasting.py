"""
SAHAYOG — Forecasting Algorithm Module.

Estimates resource depletion rate and time-to-shortage per (district, resource_type).
Generates predictive warnings (FR-FOR-01 / SDD §4.3).
"""

from typing import Dict, Any
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.resource import Resource
from app.models.need import Need
from app.models.district import District


async def estimate_time_to_depletion(
    db: AsyncSession,
    district_id: UUID,
    resource_type: str,
) -> Dict[str, Any]:
    """
    Calculate estimated time to depletion for a given district and resource type.

    Returns dict with:
    - district_id
    - resource_type
    - current_available_stock
    - active_need_quantity
    - estimated_hours_remaining
    - status ('SUFFICIENT' | 'CRITICAL' | 'DEPLETED')
    """
    # Current available stock
    res_q = select(func.coalesce(func.sum(Resource.quantity_available), 0)).where(
        Resource.district_id == district_id,
        Resource.resource_type == resource_type,
        Resource.status == "AVAILABLE",
    )
    stock = float((await db.execute(res_q)).scalar())

    # Active unmet demand
    need_q = select(func.coalesce(func.sum(Need.quantity_needed - Need.quantity_fulfilled), 0)).where(
        Need.district_id == district_id,
        Need.resource_type == resource_type,
        Need.status != "RESOLVED",
    )
    unmet_demand = float((await db.execute(need_q)).scalar())

    # Simple burn rate estimate: assuming linear consumption rate per hour based on demand
    burn_rate_per_hour = max(unmet_demand / 12.0, 1.0) if unmet_demand > 0 else 0.0

    if stock <= 0:
        hours_remaining = 0.0
        status_flag = "DEPLETED"
    elif burn_rate_per_hour == 0.0:
        hours_remaining = 999.0  # Safe stock
        status_flag = "SUFFICIENT"
    else:
        hours_remaining = round(stock / burn_rate_per_hour, 1)
        status_flag = "CRITICAL" if hours_remaining <= 6.0 else "SUFFICIENT"

    return {
        "district_id": str(district_id),
        "resource_type": resource_type,
        "current_available_stock": stock,
        "active_unmet_demand": unmet_demand,
        "estimated_hours_remaining": hours_remaining,
        "status": status_flag,
    }
