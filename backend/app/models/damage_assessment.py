"""
SAHAYOG — DamageAssessment model.

Represents a post-disaster damage report and recovery restoration case.
Satisfies SIH26206 Phase 3 requirements.
"""

import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class DamageAssessment(Base):
    __tablename__ = "damage_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    field_report_id = Column(
        UUID(as_uuid=True),
        ForeignKey("field_reports.id", ondelete="SET NULL"),
        nullable=True,
        comment="Linked field incident report if converted from Phase 2",
    )
    title = Column(String(150), nullable=False, comment="Damage assessment title")
    district_id = Column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False,
    )
    location_name = Column(String(150), nullable=False)
    damage_category = Column(
        String(40),
        nullable=False,
        comment="ROAD|BRIDGE|HOSPITAL|SCHOOL|POWER_INFRASTRUCTURE|WATER_INFRASTRUCTURE|SHELTER|RESIDENTIAL_AREA|OTHER",
    )
    severity = Column(String(10), nullable=False, comment="CRITICAL|HIGH|MEDIUM|LOW")
    priority_level = Column(String(15), nullable=False, default="HIGH", comment="IMMEDIATE|HIGH|MEDIUM|LOW")
    recovery_score = Column(Float, nullable=False, default=75.0, comment="Transparent priority score 0-100")
    affected_population = Column(Numeric, nullable=False, default=0, comment="Estimated population affected")
    estimated_cost_inr = Column(Numeric, nullable=True, comment="Estimated financial repair cost in INR")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    photo_url = Column(String(500), nullable=True)
    status = Column(
        String(30),
        nullable=False,
        default="REPORTED",
        comment="REPORTED|ASSESSED|PRIORITIZED|RESTORATION_STARTED|RESTORED|VERIFIED",
    )
    assessed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
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
    assessor = relationship("User", foreign_keys=[assessed_by], lazy="selectin")
    field_report = relationship("FieldReport", foreign_keys=[field_report_id], lazy="selectin")

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_damage_assessments_district_status", "district_id", "status"),
        Index("ix_damage_assessments_category_priority", "damage_category", "priority_level"),
    )

    def __repr__(self) -> str:
        return (
            f"<DamageAssessment id={str(self.id)[:8]} cat={self.damage_category} "
            f"score={self.recovery_score} status={self.status}>"
        )
