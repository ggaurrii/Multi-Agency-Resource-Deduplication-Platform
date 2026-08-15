"""
SAHAYOG — Unit tests for Dashboard, Notification schemas, and Forecasting.
"""

from uuid import uuid4
from datetime import datetime, timezone

from app.schemas.notification import NotificationResponse
from app.api.v1.dashboard import ResourceOverview, NeedOverview, DistrictBalance, DashboardSummaryResponse


def test_notification_schema():
    notif_id = uuid4()
    now = datetime.now(timezone.utc)

    n = NotificationResponse(
        id=notif_id,
        type="SHORTAGE_ALERT",
        message="Critical shortage of drinking water in Kota",
        severity="CRITICAL",
        created_at=now,
    )

    assert n.id == notif_id
    assert n.type == "SHORTAGE_ALERT"
    assert n.severity == "CRITICAL"


def test_dashboard_summary_schema():
    res_ov = ResourceOverview(total_resources=100.0, available=80.0, reserved=10.0, in_transit=10.0)
    need_ov = NeedOverview(total_needs=5, open=3, partially_met=1, resolved=1, critical_count=2)
    bal = DistrictBalance(
        district_id=str(uuid4()),
        district_name="Kota",
        resource_type="BOAT",
        total_available=10.0,
        total_needed=15.0,
        net_balance=-5.0,
    )

    summary = DashboardSummaryResponse(
        resources=res_ov,
        needs=need_ov,
        balances=[bal],
        unread_alerts_count=1,
    )

    assert summary.resources.total_resources == 100.0
    assert summary.needs.critical_count == 2
    assert summary.balances[0].net_balance == -5.0
