"""
SAHAYOG — Models package.

Import all models here so Alembic and SQLAlchemy can discover them.
12 entities total: Agency, User, District, Resource, Need,
Allocation, AllocationItem, RefreshToken, Notification, AuditLog, FieldReport, DamageAssessment.
"""

from app.models.agency import Agency
from app.models.allocation import Allocation, AllocationItem
from app.models.audit_log import AuditLog
from app.models.damage_assessment import DamageAssessment
from app.models.district import District
from app.models.field_report import FieldReport
from app.models.need import Need
from app.models.notification import Notification
from app.models.refresh_token import RefreshToken
from app.models.resource import Resource
from app.models.user import User

__all__ = [
    "Agency",
    "User",
    "District",
    "Resource",
    "Need",
    "Allocation",
    "AllocationItem",
    "RefreshToken",
    "Notification",
    "AuditLog",
    "FieldReport",
    "DamageAssessment",
]
