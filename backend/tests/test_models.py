"""
Tests for Phase 2 — SQLAlchemy model structure and constraints.

These tests verify all 10 models are correctly defined with proper:
- Columns and types
- Foreign keys
- CHECK constraints
- Indexes
- Relationships

No database connection required — these test metadata only.
"""

from sqlalchemy import inspect as sa_inspect

from app.db.base import Base
import app.models as models


class TestModelRegistration:
    """Verify all 10 models are registered in Base.metadata."""

    def test_all_tables_registered(self):
        expected = {
            "agencies", "users", "districts", "resources", "needs",
            "allocations", "allocation_items", "refresh_tokens",
            "notifications", "audit_logs",
        }
        actual = set(Base.metadata.tables.keys())
        assert expected == actual, f"Missing tables: {expected - actual}, Extra: {actual - expected}"

    def test_model_count(self):
        assert len(Base.metadata.tables) == 10


class TestAgencyModel:
    def test_columns(self):
        t = Base.metadata.tables["agencies"]
        cols = {c.name for c in t.columns}
        assert cols == {"id", "name", "type", "contact_info", "created_at", "updated_at"}

    def test_primary_key(self):
        t = Base.metadata.tables["agencies"]
        pk_cols = [c.name for c in t.primary_key.columns]
        assert pk_cols == ["id"]


class TestUserModel:
    def test_columns(self):
        t = Base.metadata.tables["users"]
        cols = {c.name for c in t.columns}
        expected = {"id", "agency_id", "name", "email", "role", "password_hash", "is_active", "created_at", "updated_at"}
        assert cols == expected

    def test_email_unique(self):
        t = Base.metadata.tables["users"]
        email_col = t.c.email
        assert email_col.unique is True

    def test_agency_fk(self):
        t = Base.metadata.tables["users"]
        fk_cols = {fk.target_fullname for fk in t.foreign_keys}
        assert "agencies.id" in fk_cols

    def test_agency_id_nullable(self):
        """SUPER_ADMIN users have no agency."""
        t = Base.metadata.tables["users"]
        assert t.c.agency_id.nullable is True


class TestDistrictModel:
    def test_columns(self):
        t = Base.metadata.tables["districts"]
        cols = {c.name for c in t.columns}
        expected = {"id", "name", "state", "geometry", "centroid_lat", "centroid_lng", "affected_population", "created_at"}
        assert cols == expected


class TestResourceModel:
    def test_columns(self):
        t = Base.metadata.tables["resources"]
        cols = {c.name for c in t.columns}
        expected = {
            "id", "agency_id", "district_id", "resource_type",
            "quantity_total", "quantity_available", "quantity_reserved", "quantity_in_transit",
            "unit", "location", "status", "expiry", "created_at", "updated_at",
        }
        assert cols == expected

    def test_quantity_check_constraints(self):
        t = Base.metadata.tables["resources"]
        check_names = {
            c.name for c in t.constraints
            if hasattr(c, "name") and c.name and c.name.startswith("ck_resource_")
        }
        expected = {
            "ck_resource_qty_total_non_negative",
            "ck_resource_qty_available_non_negative",
            "ck_resource_qty_reserved_non_negative",
            "ck_resource_qty_in_transit_non_negative",
            "ck_resource_qty_invariant",
        }
        assert expected == check_names, f"Missing: {expected - check_names}"

    def test_foreign_keys(self):
        t = Base.metadata.tables["resources"]
        fk_targets = {fk.target_fullname for fk in t.foreign_keys}
        assert "agencies.id" in fk_targets
        assert "districts.id" in fk_targets

    def test_composite_indexes(self):
        t = Base.metadata.tables["resources"]
        idx_names = {idx.name for idx in t.indexes}
        assert "ix_resources_district_type" in idx_names
        assert "ix_resources_agency_type" in idx_names
        assert "ix_resources_type_status" in idx_names


class TestNeedModel:
    def test_columns(self):
        t = Base.metadata.tables["needs"]
        cols = {c.name for c in t.columns}
        expected = {
            "id", "district_id", "resource_type", "quantity_needed", "quantity_fulfilled",
            "priority", "deadline", "status", "created_by", "created_at", "updated_at",
        }
        assert cols == expected

    def test_check_constraints(self):
        t = Base.metadata.tables["needs"]
        check_names = {
            c.name for c in t.constraints
            if hasattr(c, "name") and c.name and c.name.startswith("ck_need_")
        }
        assert "ck_need_qty_positive" in check_names
        assert "ck_need_qty_fulfilled_non_negative" in check_names


class TestAllocationModel:
    def test_allocation_columns(self):
        t = Base.metadata.tables["allocations"]
        cols = {c.name for c in t.columns}
        expected = {"id", "need_id", "status", "authorized_by", "authorized_at", "created_at", "updated_at"}
        assert cols == expected

    def test_allocation_item_columns(self):
        t = Base.metadata.tables["allocation_items"]
        cols = {c.name for c in t.columns}
        expected = {"id", "allocation_id", "resource_id", "quantity_allocated", "distance_km", "created_at"}
        assert cols == expected

    def test_allocation_item_cascade(self):
        """AllocationItems should cascade delete with their parent Allocation."""
        t = Base.metadata.tables["allocation_items"]
        for fk in t.foreign_keys:
            if fk.target_fullname == "allocations.id":
                assert fk.ondelete == "CASCADE"

    def test_authorized_by_nullable(self):
        """authorized_by is null until a Command Centre operator authorizes."""
        t = Base.metadata.tables["allocations"]
        assert t.c.authorized_by.nullable is True


class TestRefreshTokenModel:
    def test_columns(self):
        t = Base.metadata.tables["refresh_tokens"]
        cols = {c.name for c in t.columns}
        expected = {"id", "user_id", "token_hash", "expires_at", "revoked_at", "created_at"}
        assert cols == expected

    def test_token_hash_unique(self):
        t = Base.metadata.tables["refresh_tokens"]
        # Check either column-level or index-level unique
        hash_indexes = [idx for idx in t.indexes if "token_hash" in [c.name for c in idx.columns]]
        has_unique = any(idx.unique for idx in hash_indexes) or t.c.token_hash.unique
        assert has_unique


class TestNotificationModel:
    def test_columns(self):
        t = Base.metadata.tables["notifications"]
        cols = {c.name for c in t.columns}
        expected = {"id", "type", "ref_id", "ref_type", "message", "severity", "target_agency_id", "created_at", "read_at"}
        assert cols == expected


class TestAuditLogModel:
    def test_columns(self):
        t = Base.metadata.tables["audit_logs"]
        cols = {c.name for c in t.columns}
        expected = {"id", "user_id", "action", "entity", "entity_id", "before_state", "after_state", "timestamp"}
        assert cols == expected

    def test_jsonb_columns(self):
        """before_state and after_state should be JSONB."""
        t = Base.metadata.tables["audit_logs"]
        assert "JSONB" in str(t.c.before_state.type)
        assert "JSONB" in str(t.c.after_state.type)

    def test_indexes(self):
        t = Base.metadata.tables["audit_logs"]
        idx_names = {idx.name for idx in t.indexes}
        assert "ix_audit_logs_entity" in idx_names
        assert "ix_audit_logs_user_action" in idx_names
        assert "ix_audit_logs_timestamp" in idx_names
