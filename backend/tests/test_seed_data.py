"""
Tests for Phase 3 — Seed data validation.

Validates seed data structure, idempotent UUID generation,
and data consistency without requiring a live database.
"""

import uuid

from scripts.seed_data import (
    AGENCIES,
    DISTRICTS,
    NEEDS,
    RESOURCES,
    USERS,
    make_id,
)


class TestSeedDataStructure:
    """Validate seed data meets MVP requirements."""

    def test_four_districts(self):
        assert len(DISTRICTS) == 4

    def test_district_names(self):
        names = {d["name"] for d in DISTRICTS}
        assert names == {"Kota", "Bundi", "Baran", "Jhalawar"}

    def test_districts_are_rajasthan(self):
        for d in DISTRICTS:
            assert d["state"] == "Rajasthan"

    def test_districts_have_coordinates(self):
        for d in DISTRICTS:
            assert d["centroid_lat"] is not None
            assert d["centroid_lng"] is not None
            assert 24.0 < d["centroid_lat"] < 26.0, f"{d['name']} lat out of range"
            assert 75.0 < d["centroid_lng"] < 77.0, f"{d['name']} lng out of range"

    def test_four_agencies(self):
        assert len(AGENCIES) == 4

    def test_agency_types(self):
        types = {a["type"] for a in AGENCIES}
        assert types == {"NDRF", "ARMY", "NGO", "STATE_AUTHORITY"}

    def test_eight_users(self):
        assert len(USERS) == 8

    def test_all_roles_represented(self):
        roles = {u["role"] for u in USERS}
        assert roles == {"SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF"}

    def test_super_admin_has_no_agency(self):
        admins = [u for u in USERS if u["role"] == "SUPER_ADMIN"]
        for a in admins:
            assert a["agency_id"] is None

    def test_agency_users_have_valid_agency(self):
        agency_ids = {a["id"] for a in AGENCIES}
        for u in USERS:
            if u["agency_id"] is not None:
                assert u["agency_id"] in agency_ids, f"User {u['email']} has invalid agency_id"

    def test_passwords_not_empty(self):
        for u in USERS:
            assert len(u["password"]) >= 8

    def test_unique_emails(self):
        emails = [u["email"] for u in USERS]
        assert len(emails) == len(set(emails)), "Duplicate emails in seed data"


class TestSeedResources:
    """Validate resource seed data."""

    def test_resource_count(self):
        assert len(RESOURCES) >= 15, "Should have at least 15 resource records"

    def test_all_five_resource_types(self):
        types = {r["resource_type"] for r in RESOURCES}
        assert types == {"BOAT", "AMBULANCE", "GENERATOR", "FOOD_PACKET", "DRINKING_WATER"}

    def test_multi_agency_in_same_district(self):
        """Kota should have resources from multiple agencies."""
        kota_id = make_id("district-kota")
        kota_agencies = {r["agency_id"] for r in RESOURCES if r["district_id"] == kota_id}
        assert len(kota_agencies) >= 2, "Kota should have resources from at least 2 agencies"

    def test_quantity_invariant(self):
        """All resources must satisfy: avail + reserved + in_transit <= total."""
        for r in RESOURCES:
            total = r["quantity_total"]
            avail = r["quantity_available"]
            reserved = r.get("quantity_reserved", 0)
            in_transit = r.get("quantity_in_transit", 0)
            assert avail + reserved + in_transit <= total, (
                f"Invariant violated for {r['resource_type']}: "
                f"{avail} + {reserved} + {in_transit} > {total}"
            )

    def test_no_negative_quantities(self):
        for r in RESOURCES:
            assert r["quantity_total"] >= 0
            assert r["quantity_available"] >= 0
            assert r.get("quantity_reserved", 0) >= 0
            assert r.get("quantity_in_transit", 0) >= 0

    def test_resources_have_locations(self):
        for r in RESOURCES:
            assert "lat" in r and "lng" in r

    def test_partial_allocation_example_exists(self):
        """At least one resource should have non-zero reserved/in_transit."""
        has_partial = any(
            r.get("quantity_reserved", 0) > 0 or r.get("quantity_in_transit", 0) > 0
            for r in RESOURCES
        )
        assert has_partial, "Seed should include at least one partially allocated resource"


class TestSeedNeeds:
    """Validate need seed data."""

    def test_need_count(self):
        assert len(NEEDS) >= 5

    def test_critical_need_exists(self):
        critical = [n for n in NEEDS if n["priority"] == "CRITICAL"]
        assert len(critical) >= 1

    def test_high_need_exists(self):
        high = [n for n in NEEDS if n["priority"] == "HIGH"]
        assert len(high) >= 1

    def test_partially_met_exists(self):
        partial = [n for n in NEEDS if n["status"] == "PARTIALLY_MET"]
        assert len(partial) >= 1

    def test_resolved_exists(self):
        resolved = [n for n in NEEDS if n["status"] == "RESOLVED"]
        assert len(resolved) >= 1

    def test_resolved_has_full_fulfillment(self):
        for n in NEEDS:
            if n["status"] == "RESOLVED":
                assert n["quantity_fulfilled"] >= n["quantity_needed"], (
                    f"RESOLVED need should have fulfilled >= needed"
                )

    def test_partially_met_has_partial_fulfillment(self):
        for n in NEEDS:
            if n["status"] == "PARTIALLY_MET":
                assert 0 < n["quantity_fulfilled"] < n["quantity_needed"]


class TestIdempotency:
    """Verify deterministic UUID generation."""

    def test_same_name_same_uuid(self):
        id1 = make_id("test-entity")
        id2 = make_id("test-entity")
        assert id1 == id2

    def test_different_name_different_uuid(self):
        id1 = make_id("entity-a")
        id2 = make_id("entity-b")
        assert id1 != id2

    def test_all_ids_unique(self):
        all_ids = (
            [d["id"] for d in DISTRICTS]
            + [a["id"] for a in AGENCIES]
            + [u["id"] for u in USERS]
            + [r["id"] for r in RESOURCES]
            + [n["id"] for n in NEEDS]
        )
        assert len(all_ids) == len(set(all_ids)), "Duplicate IDs in seed data"
