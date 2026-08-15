"""
SAHAYOG — Demo reset script.

Drops all data and re-seeds from scratch.
Useful between demo runs for SIH evaluation.

Usage:
  python -m scripts.reset_demo
"""

import sys

sys.path.insert(0, ".")

from sqlalchemy.orm import sessionmaker

from app.db.database import sync_engine
from app.models import (
    Agency,
    Allocation,
    AllocationItem,
    AuditLog,
    District,
    Need,
    Notification,
    RefreshToken,
    Resource,
    User,
)


def reset_all() -> None:
    """Delete all data in dependency order, then re-seed."""
    print("=" * 60)
    print("SAHAYOG — Resetting demo data")
    print("=" * 60)

    SessionLocal = sessionmaker(bind=sync_engine)

    with SessionLocal() as session:
        try:
            # Delete in reverse dependency order
            tables_in_order = [
                AuditLog,
                Notification,
                RefreshToken,
                AllocationItem,
                Allocation,
                Need,
                Resource,
                User,
                District,
                Agency,
            ]
            for model in tables_in_order:
                count = session.query(model).delete()
                print(f"  Deleted {count} rows from {model.__tablename__}")

            session.commit()
            print("\n✅ All data cleared.")

        except Exception as e:
            session.rollback()
            print(f"\n❌ Reset failed: {e}")
            raise

    # Re-seed
    print("\n🔄 Re-seeding...")
    from scripts.seed_data import run_seed

    run_seed()


if __name__ == "__main__":
    reset_all()
