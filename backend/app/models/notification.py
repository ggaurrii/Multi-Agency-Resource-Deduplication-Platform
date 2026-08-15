"""
SAHAYOG — Notification model.

System alerts for duplicate deployments, shortage alerts, and forecasting alerts.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(
        String(40),
        nullable=False,
        comment="DUPLICATE_DEPLOYMENT|SHORTAGE_ALERT|FORECAST_ALERT",
    )
    ref_id = Column(UUID(as_uuid=True), nullable=True, comment="Referenced entity ID")
    ref_type = Column(String(40), nullable=True, comment="resource|need|allocation")
    message = Column(Text, nullable=False)
    severity = Column(String(10), nullable=False, comment="CRITICAL|HIGH|MEDIUM|LOW")
    target_agency_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agencies.id", ondelete="SET NULL"),
        nullable=True,
        comment="Scoped to a specific agency, or NULL for global",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_notifications_type_severity", "type", "severity"),
        Index("ix_notifications_read_at", "read_at"),
    )

    def __repr__(self) -> str:
        return f"<Notification {self.type} severity={self.severity}>"
