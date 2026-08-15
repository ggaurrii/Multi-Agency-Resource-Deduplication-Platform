"""
SAHAYOG — Deterministic seed data for the MVP flood-relief demo.

Creates:
  - 4 Rajasthan districts (Kota, Bundi, Baran, Jhalawar)
  - 4 agencies (NDRF, Army, NGO, State Authority)
  - 8 users (2 per role type)
  - ~20 resource records across all agencies/districts
  - 5 need records (CRITICAL, HIGH, partially met, resolved, open)

IDEMPOTENT: safe to run multiple times — checks for existing data
before inserting.

Usage:
  # Inside Docker container:
  python -m scripts.seed_data

  # Locally (with DATABASE_URL_SYNC pointing to a running PG):
  PYTHONPATH=. python scripts/seed_data.py
"""

import sys
import uuid
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy import select, text
from sqlalchemy.orm import Session

# Ensure imports work from project root
sys.path.insert(0, ".")

from app.core.config import get_settings
from app.db.database import sync_engine
from app.models import (
    Agency,
    Allocation,
    AllocationItem,
    AuditLog,
    District,
    Need,
    Notification,
    Resource,
    User,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

# ─── Deterministic UUIDs (reproducible across runs) ──────────
# Using uuid5 with a namespace so the same seed always produces
# the same IDs, making seeding idempotent.
NS = uuid.UUID("12345678-1234-5678-1234-567812345678")


def make_id(name: str) -> uuid.UUID:
    """Generate a deterministic UUID from a name."""
    return uuid.uuid5(NS, name)


# ─── District data ──────────────────────────────────────────
DISTRICTS = [
    {
        "id": make_id("district-kota"),
        "name": "Kota",
        "state": "Rajasthan",
        "centroid_lat": 25.2138,
        "centroid_lng": 75.8648,
        "affected_population": 150000,
    },
    {
        "id": make_id("district-bundi"),
        "name": "Bundi",
        "state": "Rajasthan",
        "centroid_lat": 25.4305,
        "centroid_lng": 75.6499,
        "affected_population": 85000,
    },
    {
        "id": make_id("district-baran"),
        "name": "Baran",
        "state": "Rajasthan",
        "centroid_lat": 25.1012,
        "centroid_lng": 76.5132,
        "affected_population": 60000,
    },
    {
        "id": make_id("district-jhalawar"),
        "name": "Jhalawar",
        "state": "Rajasthan",
        "centroid_lat": 24.5974,
        "centroid_lng": 76.1660,
        "affected_population": 45000,
    },
]

# ─── Agency data ─────────────────────────────────────────────
AGENCIES = [
    {
        "id": make_id("agency-ndrf"),
        "name": "NDRF Battalion 5",
        "type": "NDRF",
        "contact_info": {"phone": "+91-11-26107953", "email": "ndrf5@ndrf.gov.in"},
    },
    {
        "id": make_id("agency-army"),
        "name": "Indian Army - Jaipur Division",
        "type": "ARMY",
        "contact_info": {"phone": "+91-141-2222000", "email": "ops@army.mil.in"},
    },
    {
        "id": make_id("agency-ngo"),
        "name": "Relief Foundation India",
        "type": "NGO",
        "contact_info": {"phone": "+91-98765-43210", "email": "ops@relieffoundation.org"},
    },
    {
        "id": make_id("agency-state"),
        "name": "Rajasthan State Disaster Management Authority",
        "type": "STATE_AUTHORITY",
        "contact_info": {"phone": "+91-141-2227296", "email": "sdma@rajasthan.gov.in"},
    },
]

# ─── User data ───────────────────────────────────────────────
USERS = [
    # Super Admin (no agency)
    {
        "id": make_id("user-superadmin"),
        "agency_id": None,
        "name": "System Administrator",
        "email": "admin@sahayog.gov.in",
        "role": "SUPER_ADMIN",
        "password": "Admin@123",
    },
    # State Operator (Command Centre)
    {
        "id": make_id("user-state-op1"),
        "agency_id": make_id("agency-state"),
        "name": "Rajesh Kumar",
        "email": "rajesh.kumar@sdma.rajasthan.gov.in",
        "role": "STATE_OPERATOR",
        "password": "StateOp@123",
    },
    # NDRF users
    {
        "id": make_id("user-ndrf-admin"),
        "agency_id": make_id("agency-ndrf"),
        "name": "Col. Anil Sharma",
        "email": "anil.sharma@ndrf.gov.in",
        "role": "AGENCY_ADMIN",
        "password": "NdrfAdmin@123",
    },
    {
        "id": make_id("user-ndrf-staff"),
        "agency_id": make_id("agency-ndrf"),
        "name": "Suresh Yadav",
        "email": "suresh.yadav@ndrf.gov.in",
        "role": "AGENCY_STAFF",
        "password": "NdrfStaff@123",
    },
    # Army users
    {
        "id": make_id("user-army-admin"),
        "agency_id": make_id("agency-army"),
        "name": "Brig. Vikram Singh",
        "email": "vikram.singh@army.mil.in",
        "role": "AGENCY_ADMIN",
        "password": "ArmyAdmin@123",
    },
    {
        "id": make_id("user-army-staff"),
        "agency_id": make_id("agency-army"),
        "name": "Havaldar Ramprasad",
        "email": "ramprasad@army.mil.in",
        "role": "AGENCY_STAFF",
        "password": "ArmyStaff@123",
    },
    # NGO users
    {
        "id": make_id("user-ngo-admin"),
        "agency_id": make_id("agency-ngo"),
        "name": "Priya Mehta",
        "email": "priya.mehta@relieffoundation.org",
        "role": "AGENCY_ADMIN",
        "password": "NgoAdmin@123",
    },
    {
        "id": make_id("user-ngo-staff"),
        "agency_id": make_id("agency-ngo"),
        "name": "Amit Patel",
        "email": "amit.patel@relieffoundation.org",
        "role": "AGENCY_STAFF",
        "password": "NgoStaff@123",
    },
]

# ─── Resource data ───────────────────────────────────────────
now = datetime.now(timezone.utc)

RESOURCES = [
    # ── NDRF resources (Kota) ────────────────────────────────
    {
        "id": make_id("res-ndrf-boats-kota"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-kota"),
        "resource_type": "BOAT",
        "quantity_total": 20,
        "quantity_available": 20,
        "unit": "units",
        "lat": 25.18, "lng": 75.85,
    },
    {
        "id": make_id("res-ndrf-ambulances-kota"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-kota"),
        "resource_type": "AMBULANCE",
        "quantity_total": 8,
        "quantity_available": 8,
        "unit": "units",
        "lat": 25.20, "lng": 75.87,
    },
    {
        "id": make_id("res-ndrf-generators-kota"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-kota"),
        "resource_type": "GENERATOR",
        "quantity_total": 15,
        "quantity_available": 15,
        "unit": "units",
        "lat": 25.21, "lng": 75.86,
    },
    {
        "id": make_id("res-ndrf-food-kota"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-kota"),
        "resource_type": "FOOD_PACKET",
        "quantity_total": 5000,
        "quantity_available": 5000,
        "unit": "packets",
        "lat": 25.22, "lng": 75.87,
    },
    # ── Army resources (Bundi) ───────────────────────────────
    {
        "id": make_id("res-army-boats-bundi"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-bundi"),
        "resource_type": "BOAT",
        "quantity_total": 15,
        "quantity_available": 15,
        "unit": "units",
        "lat": 25.44, "lng": 75.64,
    },
    {
        "id": make_id("res-army-ambulances-bundi"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-bundi"),
        "resource_type": "AMBULANCE",
        "quantity_total": 5,
        "quantity_available": 5,
        "unit": "units",
        "lat": 25.43, "lng": 75.65,
    },
    {
        "id": make_id("res-army-water-bundi"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-bundi"),
        "resource_type": "DRINKING_WATER",
        "quantity_total": 10000,
        "quantity_available": 10000,
        "unit": "liters",
        "lat": 25.42, "lng": 75.66,
    },
    {
        "id": make_id("res-army-generators-bundi"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-bundi"),
        "resource_type": "GENERATOR",
        "quantity_total": 10,
        "quantity_available": 10,
        "unit": "units",
        "lat": 25.43, "lng": 75.63,
    },
    # ── NGO resources (Baran) ────────────────────────────────
    {
        "id": make_id("res-ngo-boats-baran"),
        "agency_id": make_id("agency-ngo"),
        "district_id": make_id("district-baran"),
        "resource_type": "BOAT",
        "quantity_total": 10,
        "quantity_available": 10,
        "unit": "units",
        "lat": 25.10, "lng": 76.51,
    },
    {
        "id": make_id("res-ngo-food-baran"),
        "agency_id": make_id("agency-ngo"),
        "district_id": make_id("district-baran"),
        "resource_type": "FOOD_PACKET",
        "quantity_total": 8000,
        "quantity_available": 8000,
        "unit": "packets",
        "lat": 25.11, "lng": 76.52,
    },
    {
        "id": make_id("res-ngo-water-baran"),
        "agency_id": make_id("agency-ngo"),
        "district_id": make_id("district-baran"),
        "resource_type": "DRINKING_WATER",
        "quantity_total": 15000,
        "quantity_available": 15000,
        "unit": "liters",
        "lat": 25.09, "lng": 76.50,
    },
    # ── NDRF resources (Jhalawar) ────────────────────────────
    {
        "id": make_id("res-ndrf-boats-jhalawar"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-jhalawar"),
        "resource_type": "BOAT",
        "quantity_total": 12,
        "quantity_available": 12,
        "unit": "units",
        "lat": 24.60, "lng": 76.17,
    },
    {
        "id": make_id("res-ndrf-water-jhalawar"),
        "agency_id": make_id("agency-ndrf"),
        "district_id": make_id("district-jhalawar"),
        "resource_type": "DRINKING_WATER",
        "quantity_total": 8000,
        "quantity_available": 8000,
        "unit": "liters",
        "lat": 24.59, "lng": 76.16,
    },
    # ── Army resources (Kota — to show multi-agency in same district) ──
    {
        "id": make_id("res-army-boats-kota"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-kota"),
        "resource_type": "BOAT",
        "quantity_total": 10,
        "quantity_available": 10,
        "unit": "units",
        "lat": 25.17, "lng": 75.83,
    },
    {
        "id": make_id("res-army-food-kota"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-kota"),
        "resource_type": "FOOD_PACKET",
        "quantity_total": 3000,
        "quantity_available": 3000,
        "unit": "packets",
        "lat": 25.19, "lng": 75.84,
    },
    # ── NGO resources (Kota) ─────────────────────────────────
    {
        "id": make_id("res-ngo-food-kota"),
        "agency_id": make_id("agency-ngo"),
        "district_id": make_id("district-kota"),
        "resource_type": "FOOD_PACKET",
        "quantity_total": 4000,
        "quantity_available": 4000,
        "unit": "packets",
        "lat": 25.23, "lng": 75.88,
    },
    # ── Some partially consumed resources ────────────────────
    {
        "id": make_id("res-army-water-kota"),
        "agency_id": make_id("agency-army"),
        "district_id": make_id("district-kota"),
        "resource_type": "DRINKING_WATER",
        "quantity_total": 12000,
        "quantity_available": 7000,
        "quantity_in_transit": 3000,
        "quantity_reserved": 2000,
        "unit": "liters",
        "lat": 25.20, "lng": 75.85,
    },
]

# ─── Need data ───────────────────────────────────────────────
NEEDS = [
    # CRITICAL need — 30 boats needed in Baran (deadline < 2 hrs)
    {
        "id": make_id("need-baran-boats-critical"),
        "district_id": make_id("district-baran"),
        "resource_type": "BOAT",
        "quantity_needed": 30,
        "quantity_fulfilled": 0,
        "priority": "CRITICAL",
        "deadline": now + timedelta(hours=1, minutes=30),
        "status": "OPEN",
        "created_by": make_id("user-state-op1"),
    },
    # HIGH need — food packets in Jhalawar (deadline < 6 hrs)
    {
        "id": make_id("need-jhalawar-food-high"),
        "district_id": make_id("district-jhalawar"),
        "resource_type": "FOOD_PACKET",
        "quantity_needed": 10000,
        "quantity_fulfilled": 0,
        "priority": "HIGH",
        "deadline": now + timedelta(hours=5),
        "status": "OPEN",
        "created_by": make_id("user-state-op1"),
    },
    # PARTIALLY_MET — drinking water in Kota
    {
        "id": make_id("need-kota-water-partial"),
        "district_id": make_id("district-kota"),
        "resource_type": "DRINKING_WATER",
        "quantity_needed": 20000,
        "quantity_fulfilled": 8000,
        "priority": "HIGH",
        "deadline": now + timedelta(hours=4),
        "status": "PARTIALLY_MET",
        "created_by": make_id("user-state-op1"),
    },
    # RESOLVED — generators in Bundi (already fulfilled)
    {
        "id": make_id("need-bundi-generators-resolved"),
        "district_id": make_id("district-bundi"),
        "resource_type": "GENERATOR",
        "quantity_needed": 8,
        "quantity_fulfilled": 8,
        "priority": "MEDIUM",
        "deadline": now + timedelta(hours=20),
        "status": "RESOLVED",
        "created_by": make_id("user-army-admin"),
    },
    # MEDIUM need — ambulances in Baran
    {
        "id": make_id("need-baran-ambulances-medium"),
        "district_id": make_id("district-baran"),
        "resource_type": "AMBULANCE",
        "quantity_needed": 6,
        "quantity_fulfilled": 0,
        "priority": "MEDIUM",
        "deadline": now + timedelta(hours=12),
        "status": "OPEN",
        "created_by": make_id("user-ngo-admin"),
    },
]


def seed_districts(session: Session) -> None:
    """Seed 4 Rajasthan districts."""
    for d in DISTRICTS:
        existing = session.execute(select(District).where(District.id == d["id"])).scalar_one_or_none()
        if existing:
            print(f"  ⏭  District '{d['name']}' already exists")
            continue
        district = District(**d)
        session.add(district)
        print(f"  ✅ District '{d['name']}' created")


def seed_agencies(session: Session) -> None:
    """Seed 4 agencies."""
    for a in AGENCIES:
        existing = session.execute(select(Agency).where(Agency.id == a["id"])).scalar_one_or_none()
        if existing:
            print(f"  ⏭  Agency '{a['name']}' already exists")
            continue
        agency = Agency(**a)
        session.add(agency)
        print(f"  ✅ Agency '{a['name']}' created")


def seed_users(session: Session) -> None:
    """Seed 8 users across all roles."""
    for u in USERS:
        existing = session.execute(select(User).where(User.id == u["id"])).scalar_one_or_none()
        if existing:
            print(f"  ⏭  User '{u['email']}' already exists")
            continue
        user = User(
            id=u["id"],
            agency_id=u["agency_id"],
            name=u["name"],
            email=u["email"],
            role=u["role"],
            password_hash=pwd_context.hash(u["password"]),
        )
        session.add(user)
        print(f"  ✅ User '{u['email']}' ({u['role']}) created")


def seed_resources(session: Session) -> None:
    """Seed ~17 resource records."""
    for r in RESOURCES:
        existing = session.execute(select(Resource).where(Resource.id == r["id"])).scalar_one_or_none()
        if existing:
            print(f"  ⏭  Resource '{r['resource_type']}' ({r['id']}) already exists")
            continue
        resource = Resource(
            id=r["id"],
            agency_id=r["agency_id"],
            district_id=r["district_id"],
            resource_type=r["resource_type"],
            quantity_total=r["quantity_total"],
            quantity_available=r["quantity_available"],
            quantity_reserved=r.get("quantity_reserved", 0),
            quantity_in_transit=r.get("quantity_in_transit", 0),
            unit=r["unit"],
            location=f"SRID=4326;POINT({r['lng']} {r['lat']})",
            status="AVAILABLE",
        )
        session.add(resource)
        print(f"  ✅ Resource '{r['resource_type']}' in district {r['district_id']} created")


def seed_needs(session: Session) -> None:
    """Seed 5 need records covering CRITICAL, HIGH, PARTIALLY_MET, RESOLVED."""
    for n in NEEDS:
        existing = session.execute(select(Need).where(Need.id == n["id"])).scalar_one_or_none()
        if existing:
            print(f"  ⏭  Need '{n['resource_type']}' ({n['id']}) already exists")
            continue
        need = Need(**n)
        session.add(need)
        print(f"  ✅ Need '{n['resource_type']}' priority={n['priority']} status={n['status']} created")


def run_seed() -> None:
    """Execute all seed operations in order."""
    print("=" * 60)
    print("SAHAYOG — Seeding demo data")
    print("=" * 60)

    from sqlalchemy.orm import sessionmaker

    SessionLocal = sessionmaker(bind=sync_engine)

    with SessionLocal() as session:
        try:
            print("\n📍 Seeding districts...")
            seed_districts(session)
            session.flush()

            print("\n🏢 Seeding agencies...")
            seed_agencies(session)
            session.flush()

            print("\n👤 Seeding users...")
            seed_users(session)
            session.flush()

            print("\n📦 Seeding resources...")
            seed_resources(session)
            session.flush()

            print("\n🚨 Seeding needs...")
            seed_needs(session)

            session.commit()
            print("\n" + "=" * 60)
            print("✅ Seed data committed successfully!")
            print("=" * 60)

            # Print summary
            from sqlalchemy import func as sa_func
            counts = {
                "Districts": session.query(District).count(),
                "Agencies": session.query(Agency).count(),
                "Users": session.query(User).count(),
                "Resources": session.query(Resource).count(),
                "Needs": session.query(Need).count(),
            }
            print("\nSummary:")
            for entity, count in counts.items():
                print(f"  {entity}: {count}")

        except Exception as e:
            session.rollback()
            print(f"\n❌ Seed failed: {e}")
            raise


if __name__ == "__main__":
    run_seed()
