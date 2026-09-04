"""
SAHAYOG — DamageAssessments / Post-Disaster API router.

Endpoints:
- GET   /api/v1/post-disaster
- GET   /api/v1/post-disaster/{id}
- POST  /api/v1/post-disaster
- PATCH /api/v1/post-disaster/{id}
- POST  /api/v1/field-reports/{id}/start-recovery-assessment
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.damage_assessment import (
    DamageAssessmentCreate,
    DamageAssessmentUpdate,
    DamageAssessmentResponse,
    DamageAssessmentListResponse,
)
from app.services.damage_assessment_service import (
    list_damage_assessments,
    get_damage_assessment,
    create_damage_assessment,
    update_damage_assessment,
    start_recovery_assessment_from_field_report,
    calculate_recovery_priority_score,
)

router = APIRouter(prefix="/post-disaster", tags=["Post Disaster Recovery"])
field_report_recovery_router = APIRouter(prefix="/field-reports", tags=["Field Reports"])


def _serialize_assessment(item) -> dict:
    """Helper to format DamageAssessment model to response dict with factors breakdown."""
    score, prio_lvl, factors = calculate_recovery_priority_score(
        severity=item.severity,
        damage_category=item.damage_category,
        affected_population=item.affected_population,
    )

    field_report_title = None
    try:
        if hasattr(item, "__dict__") and "field_report" in item.__dict__ and item.field_report:
            field_report_title = item.field_report.title
    except Exception:
        pass

    district_name = "Kota"
    try:
        if hasattr(item, "__dict__") and "district" in item.__dict__ and item.district:
            district_name = item.district.name
    except Exception:
        pass

    assessor_name = None
    try:
        if hasattr(item, "__dict__") and "assessor" in item.__dict__ and item.assessor:
            assessor_name = item.assessor.name
    except Exception:
        pass

    return {
        "id": str(item.id),
        "field_report_id": str(item.field_report_id) if item.field_report_id else None,
        "field_report_title": field_report_title,
        "title": item.title,
        "district_id": str(item.district_id),
        "district_name": district_name,
        "location_name": item.location_name,
        "damage_category": item.damage_category,
        "severity": item.severity,
        "priority_level": prio_lvl,
        "recovery_score": score,
        "factors": factors,
        "affected_population": item.affected_population,
        "estimated_cost_inr": item.estimated_cost_inr,
        "latitude": item.latitude,
        "longitude": item.longitude,
        "description": item.description,
        "photo_url": item.photo_url,
        "status": item.status,
        "assessed_by": str(item.assessed_by) if item.assessed_by else None,
        "assessor_name": assessor_name,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


@router.get("", response_model=DamageAssessmentListResponse)
@router.get("/", response_model=DamageAssessmentListResponse)
async def list_assessments_endpoint(
    district_id: Optional[UUID] = Query(None, description="Filter by district UUID"),
    severity: Optional[str] = Query(None, description="Filter by CRITICAL|HIGH|MEDIUM|LOW"),
    damage_category: Optional[str] = Query(None, description="Filter by ROAD|BRIDGE|HOSPITAL|etc"),
    status: Optional[str] = Query(None, description="Filter by REPORTED|ASSESSED|RESTORATION_STARTED|RESTORED|VERIFIED"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List post-disaster damage assessments with priority ranking and summary metrics."""
    filters = {
        "district_id": district_id,
        "severity": severity,
        "damage_category": damage_category,
        "status": status,
    }
    items, total, summary_metrics = await list_damage_assessments(db, filters, page, page_size)
    serialized = [_serialize_assessment(a) for a in items]
    return DamageAssessmentListResponse(
        items=serialized,
        total=total,
        page=page,
        page_size=page_size,
        summary_metrics=summary_metrics,
    )


@router.get("/{assessment_id}", response_model=DamageAssessmentResponse)
async def get_assessment_endpoint(
    assessment_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single damage assessment case."""
    item = await get_damage_assessment(db, assessment_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Damage assessment record not found.")
    return _serialize_assessment(item)


@router.post("", response_model=DamageAssessmentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=DamageAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment_endpoint(
    data: DamageAssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """File a post-disaster damage assessment record."""
    item = await create_damage_assessment(db, data, current_user)
    return _serialize_assessment(item)


@router.patch("/{assessment_id}", response_model=DamageAssessmentResponse)
async def update_assessment_endpoint(
    assessment_id: UUID,
    data: DamageAssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")
    ),
):
    """Update restoration lifecycle status or severity of a damage assessment case."""
    item = await update_damage_assessment(db, assessment_id, data, current_user)
    return _serialize_assessment(item)


@field_report_recovery_router.post("/{field_report_id}/start-recovery-assessment", response_model=DamageAssessmentResponse)
async def start_recovery_from_field_report_endpoint(
    field_report_id: UUID,
    data: DamageAssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")
    ),
):
    """Link/convert a resolved field incident directly to a post-disaster recovery assessment."""
    item = await start_recovery_assessment_from_field_report(db, field_report_id, data, current_user)
    return _serialize_assessment(item)
