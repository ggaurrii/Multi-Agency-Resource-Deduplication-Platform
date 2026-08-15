"""
SAHAYOG — Dashboard API Endpoint.

GET /api/v1/dashboard/summary — Aggregated disaster status summary
"""

from decimal import Decimal
from typing import Dict, List, Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.district import District
from app.models.need import Need
from app.models.notification import Notification
from app.models.resource import Resource
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


class ResourceOverview(BaseModel):
    total_resources: float
    available: float
    reserved: float
    in_transit: float


class NeedOverview(BaseModel):
    total_needs: int
    open: int
    partially_met: int
    resolved: int
    critical_count: int


class DistrictBalance(BaseModel):
    district_id: str
    district_name: str
    resource_type: str
    total_available: float
    total_needed: float
    net_balance: float  # available - needed


class DashboardSummaryResponse(BaseModel):
    resources: ResourceOverview
    needs: NeedOverview
    balances: List[DistrictBalance]
    unread_alerts_count: int


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Get disaster response dashboard summary",
)
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve aggregated dashboard metrics."""
    # 1. Resource overview
    res_query = select(
        func.coalesce(func.sum(Resource.quantity_total), 0),
        func.coalesce(func.sum(Resource.quantity_available), 0),
        func.coalesce(func.sum(Resource.quantity_reserved), 0),
        func.coalesce(func.sum(Resource.quantity_in_transit), 0),
    )
    res_stats = (await db.execute(res_query)).one()
    res_overview = ResourceOverview(
        total_resources=float(res_stats[0]),
        available=float(res_stats[1]),
        reserved=float(res_stats[2]),
        in_transit=float(res_stats[3]),
    )

    # 2. Need overview
    total_needs = (await db.scalar(select(func.count(Need.id)))) or 0
    open_needs = (await db.scalar(select(func.count(Need.id)).where(Need.status == "OPEN"))) or 0
    partially_met = (await db.scalar(select(func.count(Need.id)).where(Need.status == "PARTIALLY_MET"))) or 0
    resolved = (await db.scalar(select(func.count(Need.id)).where(Need.status == "RESOLVED"))) or 0
    critical = (await db.scalar(select(func.count(Need.id)).where(Need.priority == "CRITICAL", Need.status != "RESOLVED"))) or 0

    need_overview = NeedOverview(
        total_needs=total_needs,
        open=open_needs,
        partially_met=partially_met,
        resolved=resolved,
        critical_count=critical,
    )

    # 3. District Balances (Net surplus/deficit per district and resource type)
    districts = (await db.execute(select(District))).scalars().all()
    balances: List[DistrictBalance] = []

    for d in districts:
        for r_type in ["BOAT", "AMBULANCE", "GENERATOR", "FOOD_PACKET", "DRINKING_WATER"]:
            avail_q = select(func.coalesce(func.sum(Resource.quantity_available), 0)).where(
                Resource.district_id == d.id, Resource.resource_type == r_type, Resource.status == "AVAILABLE"
            )
            avail_val = float((await db.execute(avail_q)).scalar())

            needed_q = select(func.coalesce(func.sum(Need.quantity_needed - Need.quantity_fulfilled), 0)).where(
                Need.district_id == d.id, Need.resource_type == r_type, Need.status != "RESOLVED"
            )
            needed_val = float((await db.execute(needed_q)).scalar())

            if avail_val > 0 or needed_val > 0:
                balances.append(
                    DistrictBalance(
                        district_id=str(d.id),
                        district_name=d.name,
                        resource_type=r_type,
                        total_available=avail_val,
                        total_needed=needed_val,
                        net_balance=avail_val - needed_val,
                    )
                )

    # 4. Unread alerts count
    unread_count = (await db.scalar(select(func.count(Notification.id)).where(Notification.read_at.is_(None)))) or 0

    return DashboardSummaryResponse(
        resources=res_overview,
        needs=need_overview,
        balances=balances,
        unread_alerts_count=unread_count,
    )
