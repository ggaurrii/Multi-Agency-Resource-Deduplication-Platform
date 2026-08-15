"""
SAHAYOG — Priority Classification Algorithm.

Implements the automated priority derivation logic from SRS FR-PRI-01 and SDD §4.3.
Priority is computed based on the time remaining between the current UTC time
(or an optionally provided reference time) and the need's fulfillment deadline.
"""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional


class PriorityLevel(str, Enum):
    """Supported priority classification levels for relief needs."""

    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


# Threshold constants (in hours)
CRITICAL_THRESHOLD_HOURS: int = 2
HIGH_THRESHOLD_HOURS: int = 6
MEDIUM_THRESHOLD_HOURS: int = 24


def classify_priority(
    deadline: datetime,
    reference_time: Optional[datetime] = None,
) -> str:
    """Derive priority from deadline based on remaining time until deadline.

    Priority classification tiers (SRS FR-PRI-01 / SDD §4.3):
        - CRITICAL: <= 2 hours remaining (including deadlines in the past)
        - HIGH:     <= 6 hours remaining (> 2 hours and <= 6 hours)
        - MEDIUM:   <= 24 hours remaining (> 6 hours and <= 24 hours)
        - LOW:      > 24 hours remaining

    Args:
        deadline: The target fulfillment deadline. Can be timezone-aware or naive
            (naive datetimes are treated as UTC).
        reference_time: Optional reference time to compare against. If None,
            defaults to the current UTC time (datetime.now(timezone.utc)).
            Can be passed explicitly for deterministic calculations and testing.

    Returns:
        str: Priority category — 'CRITICAL', 'HIGH', 'MEDIUM', or 'LOW'.

    Raises:
        TypeError: If deadline or reference_time is not a datetime instance.
    """
    if not isinstance(deadline, datetime):
        raise TypeError(f"deadline must be a datetime instance, got {type(deadline).__name__}")

    # Ensure deadline is timezone-aware (assume UTC if naive)
    if deadline.tzinfo is None or deadline.tzinfo.utcoffset(deadline) is None:
        deadline = deadline.replace(tzinfo=timezone.utc)

    # Determine reference time
    if reference_time is None:
        reference_time = datetime.now(timezone.utc)
    elif not isinstance(reference_time, datetime):
        raise TypeError(
            f"reference_time must be a datetime instance, got {type(reference_time).__name__}"
        )
    elif reference_time.tzinfo is None or reference_time.tzinfo.utcoffset(reference_time) is None:
        reference_time = reference_time.replace(tzinfo=timezone.utc)

    remaining = deadline - reference_time

    # Evaluate priority tiers
    if remaining <= timedelta(hours=CRITICAL_THRESHOLD_HOURS):
        return PriorityLevel.CRITICAL.value

    if remaining <= timedelta(hours=HIGH_THRESHOLD_HOURS):
        return PriorityLevel.HIGH.value

    if remaining <= timedelta(hours=MEDIUM_THRESHOLD_HOURS):
        return PriorityLevel.MEDIUM.value

    return PriorityLevel.LOW.value
