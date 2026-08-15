# SAHAYOG Backend — Development Progress

## ✅ Phase 1: Project Scaffolding + Docker + FastAPI + DB Connection
**Status**: COMPLETE (code ready, Docker Desktop requires manual start)

### Files Created
- `docker-compose.yml` — PostGIS 15-3.4 + FastAPI service
- `Dockerfile` — Python 3.11-slim
- `.env.example` / `.env`
- `requirements.txt` — 16 pinned dependencies
- `app/core/config.py` — Pydantic Settings
- `app/db/base.py` — SQLAlchemy DeclarativeBase
- `app/db/database.py` — async + sync engines
- `app/db/session.py` — FastAPI session dependency
- `app/main.py` — health + DB health endpoints
- Package dirs: `models/`, `schemas/`, `api/v1/`, `services/`, `algorithms/`, `utils/`, `tests/`, `scripts/`

### Test Results
```
tests/test_health.py — 2 passed ✅
  test_health_endpoint — PASSED
  test_swagger_docs_available — PASSED
```

---

## ✅ Phase 2: SQLAlchemy Models + Alembic Migrations
**Status**: COMPLETE (migration pending Docker)

### 10 Entities Implemented
| Entity | Table | Columns | Key Features |
|--------|-------|---------|-------------|
| Agency | agencies | 6 | JSONB contact_info |
| User | users | 9 | email unique, agency FK nullable for SUPER_ADMIN |
| District | districts | 8 | PostGIS POLYGON geometry |
| Resource | resources | 14 | 4 quantity sub-fields, 5 CHECK constraints, PostGIS POINT location |
| Need | needs | 11 | Auto-derived priority, quantity tracking |
| Allocation | allocations | 7 | PROPOSED→ACCEPTED workflow |
| AllocationItem | allocation_items | 6 | CASCADE delete, per-resource split |
| RefreshToken | refresh_tokens | 6 | Hashed tokens only, unique constraint |
| Notification | notifications | 9 | Type/severity indexed |
| AuditLog | audit_logs | 8 | JSONB before/after snapshots |

### Resource Quantity Invariant (enforced by CHECK constraint)
```
quantity_available + quantity_reserved + quantity_in_transit <= quantity_total
All quantities >= 0
```

### Reservation Workflow
```
AVAILABLE → RESERVED (on PROPOSED allocation, transactional)
RESERVED → IN_TRANSIT (on ACCEPTED allocation)
RESERVED → AVAILABLE (on REJECTED allocation)
```

### Test Results
```
tests/test_models.py — 25 passed ✅
  All 10 tables, columns, constraints, indexes, FKs verified
```

### Alembic
- `alembic.ini` — configured
- `alembic/env.py` — PostGIS-aware, filters spatial_ref_sys
- `alembic/versions/001_initial_schema.py` — full DDL migration

---

## ⬜ Phase 3: Seed Data
**Status**: NEXT

---

## Commands

```bash
# Start the stack
cd backend
docker-compose up --build

# Run migrations (inside API container)
docker-compose exec api alembic upgrade head

# Run tests (local)
set PYTHONPATH=backend
python -m pytest tests/ -v

# Run tests (in container)
docker-compose exec api pytest tests/ -v
```

## Known Issues
- Docker Desktop not starting automatically on this Windows system.
  The user needs to manually start Docker Desktop before running `docker-compose up`.

## Database Migration Status
- Migration file `001_initial_schema.py` created — needs `alembic upgrade head` on live DB

## Test Status
- 27/27 tests passing (2 health + 25 model tests)
