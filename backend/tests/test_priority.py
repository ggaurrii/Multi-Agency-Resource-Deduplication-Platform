"""
Unit tests for the SAHAYOG priority classification algorithm (FR-PRI-01 / SDD §4.3).
"""

from datetime import datetime, timedelta, timezone
import pytest

from app.algorithms.priority import (
    CRITICAL_THRESHOLD_HOURS,
    HIGH_THRESHOLD_HOURS,
    MEDIUM_THRESHOLD_HOURS,
    PriorityLevel,
    classify_priority,
)


BASE_TIME = datetime(2026, 8, 15, 12, 0, 0, tzinfo=timezone.utc)


@pytest.mark.parametrize(
    "offset, expected_priority",
    [
        # Past deadlines -> CRITICAL
        (timedelta(days=-30), "CRITICAL"),
        (timedelta(days=-1), "CRITICAL"),
        (timedelta(hours=-5), "CRITICAL"),
        (timedelta(minutes=-1), "CRITICAL"),
        (timedelta(seconds=-1), "CRITICAL"),
        (timedelta(seconds=0), "CRITICAL"),
        # Within critical window (<= 2h) -> CRITICAL
        (timedelta(seconds=1), "CRITICAL"),
        (timedelta(minutes=30), "CRITICAL"),
        (timedelta(hours=1), "CRITICAL"),
        (timedelta(hours=1, minutes=59, seconds=59), "CRITICAL"),
        (timedelta(hours=2), "CRITICAL"),  # Exact 2h boundary
        # High priority window (> 2h and <= 6h) -> HIGH
        (timedelta(hours=2, seconds=1), "HIGH"),  # Just past 2h boundary
        (timedelta(hours=3), "HIGH"),
        (timedelta(hours=4), "HIGH"),
        (timedelta(hours=5, minutes=59, seconds=59), "HIGH"),
        (timedelta(hours=6), "HIGH"),  # Exact 6h boundary
        # Medium priority window (> 6h and <= 24h) -> MEDIUM
        (timedelta(hours=6, seconds=1), "MEDIUM"),  # Just past 6h boundary
        (timedelta(hours=12), "MEDIUM"),
        (timedelta(hours=18), "MEDIUM"),
        (timedelta(hours=23, minutes=59, seconds=59), "MEDIUM"),
        (timedelta(hours=24), "MEDIUM"),  # Exact 24h boundary
        # Low priority window (> 24h) -> LOW
        (timedelta(hours=24, seconds=1), "LOW"),  # Just past 24h boundary
        (timedelta(hours=25), "LOW"),
        (timedelta(days=2), "LOW"),
        (timedelta(days=7), "LOW"),
        (timedelta(days=365), "LOW"),
    ],
)
def test_classify_priority_boundaries(offset: timedelta, expected_priority: str):
    """Test priority classification across exact time boundaries and ranges."""
    deadline = BASE_TIME + offset
    result = classify_priority(deadline, reference_time=BASE_TIME)
    assert result == expected_priority


def test_classify_priority_default_reference_time():
    """Test classify_priority when no reference_time is explicitly passed (uses utcnow)."""
    now = datetime.now(timezone.utc)

    # Past
    assert classify_priority(now - timedelta(hours=1)) == "CRITICAL"
    # Within 2 hours
    assert classify_priority(now + timedelta(minutes=45)) == "CRITICAL"
    # Within 6 hours
    assert classify_priority(now + timedelta(hours=4)) == "HIGH"
    # Within 24 hours
    assert classify_priority(now + timedelta(hours=12)) == "MEDIUM"
    # Over 24 hours
    assert classify_priority(now + timedelta(days=2)) == "LOW"


def test_classify_priority_timezone_handling():
    """Test that offset-aware datetimes in different timezones and naive datetimes are handled correctly."""
    # IST (+05:30)
    tz_ist = timezone(timedelta(hours=5, minutes=30))
    # Reference: 12:00 UTC = 17:30 IST
    ref_utc = datetime(2026, 8, 15, 12, 0, 0, tzinfo=timezone.utc)
    # Deadline: 18:30 IST = 13:00 UTC (1 hour remaining -> CRITICAL)
    deadline_ist = datetime(2026, 8, 15, 18, 30, 0, tzinfo=tz_ist)
    assert classify_priority(deadline_ist, reference_time=ref_utc) == "CRITICAL"

    # Deadline: 21:30 IST = 16:00 UTC (4 hours remaining -> HIGH)
    deadline_ist_high = datetime(2026, 8, 15, 21, 30, 0, tzinfo=tz_ist)
    assert classify_priority(deadline_ist_high, reference_time=ref_utc) == "HIGH"

    # Naive datetimes (assumed UTC)
    naive_ref = datetime(2026, 8, 15, 12, 0, 0)
    naive_deadline_critical = datetime(2026, 8, 15, 13, 0, 0)
    naive_deadline_high = datetime(2026, 8, 15, 16, 0, 0)
    naive_deadline_medium = datetime(2026, 8, 15, 22, 0, 0)
    naive_deadline_low = datetime(2026, 8, 16, 15, 0, 0)

    assert classify_priority(naive_deadline_critical, reference_time=naive_ref) == "CRITICAL"
    assert classify_priority(naive_deadline_high, reference_time=naive_ref) == "HIGH"
    assert classify_priority(naive_deadline_medium, reference_time=naive_ref) == "MEDIUM"
    assert classify_priority(naive_deadline_low, reference_time=naive_ref) == "LOW"

    # Mixed naive and aware
    assert classify_priority(naive_deadline_critical, reference_time=ref_utc) == "CRITICAL"
    assert classify_priority(deadline_ist, reference_time=naive_ref) == "CRITICAL"


def test_classify_priority_invalid_types():
    """Test that TypeError is raised when arguments are not datetime instances."""
    with pytest.raises(TypeError, match="deadline must be a datetime instance"):
        classify_priority("2026-08-15T12:00:00")  # type: ignore

    with pytest.raises(TypeError, match="reference_time must be a datetime instance"):
        classify_priority(BASE_TIME, reference_time="2026-08-15T12:00:00")  # type: ignore


def test_priority_constants_and_enum():
    """Verify priority constants and Enum values match specifications."""
    assert PriorityLevel.CRITICAL.value == "CRITICAL"
    assert PriorityLevel.HIGH.value == "HIGH"
    assert PriorityLevel.MEDIUM.value == "MEDIUM"
    assert PriorityLevel.LOW.value == "LOW"

    assert CRITICAL_THRESHOLD_HOURS == 2
    assert HIGH_THRESHOLD_HOURS == 6
    assert MEDIUM_THRESHOLD_HOURS == 24
