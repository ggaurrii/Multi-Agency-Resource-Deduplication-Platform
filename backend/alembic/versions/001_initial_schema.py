"""initial schema - 10 entities

Revision ID: 001_initial
Revises: 
Create Date: 2026-08-15

Creates all 10 tables for the SAHAYOG MVP:
  agencies, users, districts, resources, needs,
  allocations, allocation_items, refresh_tokens,
  notifications, audit_logs

Enables PostGIS extension.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import geoalchemy2
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable PostGIS
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ── agencies ─────────────────────────────────────────────
    op.create_table(
        'agencies',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(120), nullable=False),
        sa.Column('type', sa.String(40), nullable=False, comment='NDRF|ARMY|SDRF|NGO|HOSPITAL|STATE_AUTHORITY'),
        sa.Column('contact_info', JSONB, nullable=True, comment='phone, email, address'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # ── users ────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('agency_id', UUID(as_uuid=True), sa.ForeignKey('agencies.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('role', sa.String(30), nullable=False, comment='SUPER_ADMIN|STATE_OPERATOR|AGENCY_ADMIN|AGENCY_STAFF'),
        sa.Column('password_hash', sa.String(255), nullable=False, comment='bcrypt hash, never plaintext'),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_agency_role', 'users', ['agency_id', 'role'])

    # ── districts ────────────────────────────────────────────
    op.create_table(
        'districts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('state', sa.String(100), nullable=False, server_default='Rajasthan'),
        sa.Column('geometry', geoalchemy2.Geometry(geometry_type='POLYGON', srid=4326), nullable=True,
                  comment='PostGIS boundary polygon'),
        sa.Column('centroid_lat', sa.Float(), nullable=True),
        sa.Column('centroid_lng', sa.Float(), nullable=True),
        sa.Column('affected_population', sa.Integer(), nullable=True, comment='Used by forecasting'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # ── resources ────────────────────────────────────────────
    op.create_table(
        'resources',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('agency_id', UUID(as_uuid=True), sa.ForeignKey('agencies.id', ondelete='CASCADE'), nullable=False),
        sa.Column('district_id', UUID(as_uuid=True), sa.ForeignKey('districts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resource_type', sa.String(40), nullable=False,
                  comment='BOAT|AMBULANCE|GENERATOR|FOOD_PACKET|DRINKING_WATER'),
        sa.Column('quantity_total', sa.Numeric(), nullable=False),
        sa.Column('quantity_available', sa.Numeric(), nullable=False),
        sa.Column('quantity_reserved', sa.Numeric(), nullable=False, server_default='0'),
        sa.Column('quantity_in_transit', sa.Numeric(), nullable=False, server_default='0'),
        sa.Column('unit', sa.String(30), nullable=False, server_default='units'),
        sa.Column('location', geoalchemy2.Geography(geometry_type='POINT', srid=4326), nullable=True,
                  comment='PostGIS point for distance ranking'),
        sa.Column('status', sa.String(20), nullable=False, server_default='AVAILABLE',
                  comment='AVAILABLE|DEPLOYED|IN_TRANSIT|RESERVED|DAMAGED|EXPIRED'),
        sa.Column('expiry', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    # CHECK constraints for quantity invariant
    op.create_check_constraint('ck_resource_qty_total_non_negative', 'resources', 'quantity_total >= 0')
    op.create_check_constraint('ck_resource_qty_available_non_negative', 'resources', 'quantity_available >= 0')
    op.create_check_constraint('ck_resource_qty_reserved_non_negative', 'resources', 'quantity_reserved >= 0')
    op.create_check_constraint('ck_resource_qty_in_transit_non_negative', 'resources', 'quantity_in_transit >= 0')
    op.create_check_constraint('ck_resource_qty_invariant', 'resources',
                               'quantity_available + quantity_reserved + quantity_in_transit <= quantity_total')
    # Indexes
    op.create_index('ix_resources_district_type', 'resources', ['district_id', 'resource_type'])
    op.create_index('ix_resources_agency_type', 'resources', ['agency_id', 'resource_type'])
    op.create_index('ix_resources_type_status', 'resources', ['resource_type', 'status'])

    # ── needs ────────────────────────────────────────────────
    op.create_table(
        'needs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('district_id', UUID(as_uuid=True), sa.ForeignKey('districts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('resource_type', sa.String(40), nullable=False),
        sa.Column('quantity_needed', sa.Numeric(), nullable=False),
        sa.Column('quantity_fulfilled', sa.Numeric(), nullable=False, server_default='0'),
        sa.Column('priority', sa.String(10), nullable=False,
                  comment='CRITICAL|HIGH|MEDIUM|LOW auto-derived from deadline'),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='OPEN',
                  comment='OPEN|PARTIALLY_MET|RESOLVED|EXPIRED'),
        sa.Column('created_by', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_check_constraint('ck_need_qty_positive', 'needs', 'quantity_needed > 0')
    op.create_check_constraint('ck_need_qty_fulfilled_non_negative', 'needs', 'quantity_fulfilled >= 0')
    op.create_index('ix_needs_district_type', 'needs', ['district_id', 'resource_type'])
    op.create_index('ix_needs_status_priority', 'needs', ['status', 'priority'])

    # ── allocations ──────────────────────────────────────────
    op.create_table(
        'allocations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('need_id', UUID(as_uuid=True), sa.ForeignKey('needs.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='PROPOSED',
                  comment='PROPOSED|ACCEPTED|MODIFIED|REJECTED'),
        sa.Column('authorized_by', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('authorized_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_allocations_need_status', 'allocations', ['need_id', 'status'])

    # ── allocation_items ─────────────────────────────────────
    op.create_table(
        'allocation_items',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('allocation_id', UUID(as_uuid=True), sa.ForeignKey('allocations.id', ondelete='CASCADE'),
                  nullable=False),
        sa.Column('resource_id', UUID(as_uuid=True), sa.ForeignKey('resources.id', ondelete='CASCADE'),
                  nullable=False),
        sa.Column('quantity_allocated', sa.Numeric(), nullable=False),
        sa.Column('distance_km', sa.Numeric(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_alloc_items_resource', 'allocation_items', ['resource_id'])

    # ── refresh_tokens ───────────────────────────────────────
    op.create_table(
        'refresh_tokens',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_refresh_tokens_user', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_hash', 'refresh_tokens', ['token_hash'], unique=True)

    # ── notifications ────────────────────────────────────────
    op.create_table(
        'notifications',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('type', sa.String(40), nullable=False,
                  comment='DUPLICATE_DEPLOYMENT|SHORTAGE_ALERT|FORECAST_ALERT'),
        sa.Column('ref_id', UUID(as_uuid=True), nullable=True),
        sa.Column('ref_type', sa.String(40), nullable=True),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(10), nullable=False, comment='CRITICAL|HIGH|MEDIUM|LOW'),
        sa.Column('target_agency_id', UUID(as_uuid=True), sa.ForeignKey('agencies.id', ondelete='SET NULL'),
                  nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_notifications_type_severity', 'notifications', ['type', 'severity'])
    op.create_index('ix_notifications_read_at', 'notifications', ['read_at'])

    # ── audit_logs ───────────────────────────────────────────
    op.create_table(
        'audit_logs',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(50), nullable=False,
                  comment='CREATE|UPDATE|DELETE|AUTHORIZE|REJECT|LOGIN_FAILURE'),
        sa.Column('entity', sa.String(50), nullable=False, comment='resource|need|allocation|user'),
        sa.Column('entity_id', UUID(as_uuid=True), nullable=True),
        sa.Column('before_state', JSONB, nullable=True),
        sa.Column('after_state', JSONB, nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_audit_logs_entity', 'audit_logs', ['entity', 'entity_id'])
    op.create_index('ix_audit_logs_user_action', 'audit_logs', ['user_id', 'action'])
    op.create_index('ix_audit_logs_timestamp', 'audit_logs', ['timestamp'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('notifications')
    op.drop_table('refresh_tokens')
    op.drop_table('allocation_items')
    op.drop_table('allocations')
    op.drop_table('needs')
    op.drop_table('resources')
    op.drop_table('districts')
    op.drop_table('users')
    op.drop_table('agencies')
    op.execute("DROP EXTENSION IF EXISTS postgis CASCADE")
