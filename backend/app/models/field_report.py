"""
SAHAYOG — FieldReport model.

Represents a ground incident report filed by field responders / officials.
Can be verified, responded to, and linked to a Needs Requisition.
Satisfies SIH26206 Phase 2 requirements.
"""

import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class FieldReport(Base):
    __tablename__ = "field_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(150), nullable=False, comment="Short title of the incident report")
    disaster_type = Column(
        String(40),
        nullable=False,
        comment="FLOOD|LANDSLIDE|INFRASTRUCTURE_DAMAGE|MEDICAL_EMERGENCY|OTHER",
    )
    severity = Column(String(10), nullable=False, comment="CRITICAL|HIGH|MEDIUM|LOW")
    district_id = Column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False,
    )
    location_name = Column(String(150), nullable=False, comment="Specific location / landmark name")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False, comment="Detailed field report description")
    photo_url = Column(String(500), nullable=True, comment="Photographic evidence preview URL / base64")
    status = Column(
        String(20),
        nullable=False,
        default="SUBMITTED",
        comment="SUBMITTED|VERIFIED|RESPONDED|RESOLVED",
    )
    reported_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    linked_need_id = Column(
        UUID(as_uuid=True),
        ForeignKey("needs.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # ── Relationships ────────────────────────────────────────
    district = relationship("District", lazy="selectin")
    reporter = relationship("User", foreign_keys=[reported_by], lazy="selectin")
    linked_need = relationship("Need", foreign_keys=[linked_need_id], lazy="selectin")

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_field_reports_district_status", "district_id", "status"),
        Index("ix_field_reports_severity_type", "severity", "disaster_type"),
    )

    def __repr__(self) -> str:
        return (
            f"<FieldReport id={str(self.id)[:8]} type={self.disaster_type} "
            f"severity={self.severity} status={self.status}>"
        )
