"""
SAHAYOG — AuditLog model.

Immutable audit trail for all significant operations.
Records before/after state as JSONB snapshots.
Satisfies FR-REG-05 and NFR-SEC-04.

IMPORTANT: Never log passwords, JWT secrets, or database credentials.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    action = Column(
        String(50),
        nullable=False,
        comment="CREATE|UPDATE|DELETE|AUTHORIZE|REJECT|LOGIN_FAILURE",
    )
    entity = Column(String(50), nullable=False, comment="resource|need|allocation|user")
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    before_state = Column(JSONB, nullable=True, comment="Snapshot before the change")
    after_state = Column(JSONB, nullable=True, comment="Snapshot after the change")
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    user = relationship("User", back_populates="audit_logs")

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_audit_logs_entity", "entity", "entity_id"),
        Index("ix_audit_logs_user_action", "user_id", "action"),
        Index("ix_audit_logs_timestamp", "timestamp"),
    )

    def __repr__(self) -> str:
        return f"<AuditLog {self.action} on {self.entity}:{self.entity_id}>"
