"""
SAHAYOG — DamageAssessment service layer.

Calculates transparent Recovery Priority Scores (0-100), tracks restoration lifecycle,
emits notifications, and records immutable audit logs.
Satisfies SIH26206 Phase 3 requirements.
"""

import uuid
from typing import Dict, Any, List, Tuple
from decimal import Decimal
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.damage_assessment import DamageAssessment
from app.models.field_report import FieldReport
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.damage_assessment import DamageAssessmentCreate, DamageAssessmentUpdate


def calculate_recovery_priority_score(
    severity: str,
    damage_category: str,
    affected_population: float | int | Decimal,
) -> Tuple[float, str, Dict[str, float]]:
    """
    Transparent rule-based Recovery Priority Score calculation engine (0-100).
    Factors:
    - Damage Severity (30%)
    - Infrastructure Criticality (25%)
    - Population Exposure (25%)
    - Service Disruption (20%)
    """
    pop = float(affected_population or 0)

    # 1. Severity Score (30%)
    severity_map = {"CRITICAL": 95.0, "HIGH": 75.0, "MEDIUM": 50.0, "LOW": 25.0}
    severity_score = severity_map.get(severity.upper(), 50.0)

    # 2. Infra Criticality Score (25%)
    category_map = {
        "HOSPITAL": 95.0,
        "POWER_INFRASTRUCTURE": 90.0,
        "WATER_INFRASTRUCTURE": 90.0,
        "BRIDGE": 85.0,
        "SHELTER": 80.0,
        "ROAD": 75.0,
        "SCHOOL": 70.0,
        "RESIDENTIAL_AREA": 65.0,
        "OTHER": 50.0,
    }
    infra_score = category_map.get(damage_category.upper(), 50.0)

    # 3. Population Exposure Score (25%)
    pop_score = min(100.0, (pop / 10000.0) * 100.0)

    # 4. Service Disruption Score (20%)
    disruption_score = severity_score * 0.95

    # Composite Weighted Calculation
    composite = (0.30 * severity_score) + (0.25 * infra_score) + (0.25 * pop_score) + (0.20 * disruption_score)
    final_score = round(min(100.0, max(0.0, composite)), 1)

    # Priority Classification
    if final_score >= 80.0:
        priority_level = "IMMEDIATE"
    elif final_score >= 65.0:
        priority_level = "HIGH"
    elif final_score >= 45.0:
        priority_level = "MEDIUM"
    else:
        priority_level = "LOW"

    factors = {
        "severityScore": severity_score,
        "infrastructureCriticalityScore": infra_score,
        "populationExposureScore": round(pop_score, 1),
        "serviceDisruptionScore": round(disruption_score, 1),
    }

    return final_score, priority_level, factors


async def list_damage_assessments(
    db: AsyncSession,
    filters: Dict[str, Any],
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[DamageAssessment], int, Dict[str, Any]]:
    """List post-disaster recovery assessments with filters & summary KPIs."""
    query = select(DamageAssessment).options(
        selectinload(DamageAssessment.district),
        selectinload(DamageAssessment.field_report),
        selectinload(DamageAssessment.assessor),
    )

    if filters.get("district_id"):
        query = query.where(DamageAssessment.district_id == filters["district_id"])
    if filters.get("severity"):
        query = query.where(DamageAssessment.severity == filters["severity"])
    if filters.get("damage_category"):
        query = query.where(DamageAssessment.damage_category == filters["damage_category"])
    if filters.get("status"):
        query = query.where(DamageAssessment.status == filters["status"])

    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar() or 0

    # Execute paginated list query
    query = query.order_by(desc(DamageAssessment.recovery_score)).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    items = list(result.scalars().all())

    # Summary metrics calculation
    all_query = await db.execute(select(DamageAssessment))
    all_items = list(all_query.scalars().all())

    completed_count = sum(1 for d in all_items if d.status in ("RESTORED", "VERIFIED"))
    restoration_count = sum(1 for d in all_items if d.status == "RESTORATION_STARTED")
    awaiting_count = sum(1 for d in all_items if d.status in ("REPORTED", "ASSESSED", "PRIORITIZED"))
    critical_infra_count = sum(1 for d in all_items if d.damage_category in ("HOSPITAL", "BRIDGE", "POWER_INFRASTRUCTURE", "WATER_INFRASTRUCTURE"))
    total_pop = sum(int(d.affected_population or 0) for d in all_items)
    total_cost = sum(float(d.estimated_cost_inr or 0) for d in all_items)
    overall_progress = round((completed_count / max(1, len(all_items))) * 100, 1)

    summary_metrics = {
        "total_cases": len(all_items),
        "completed_count": completed_count,
        "restoration_count": restoration_count,
        "awaiting_count": awaiting_count,
        "critical_infra_count": critical_infra_count,
        "total_affected_population": total_pop,
        "total_estimated_cost_inr": total_cost,
        "overall_recovery_progress_pct": overall_progress,
    }

    return items, total_count, summary_metrics


async def get_damage_assessment(db: AsyncSession, assessment_id: uuid.UUID) -> DamageAssessment | None:
    """Get a single damage assessment by ID."""
    result = await db.execute(
        select(DamageAssessment)
        .options(
            selectinload(DamageAssessment.district),
            selectinload(DamageAssessment.field_report),
            selectinload(DamageAssessment.assessor),
        )
        .where(DamageAssessment.id == assessment_id)
    )
    return result.scalar_one_or_none()
    return result.scalar_one_or_none()


async def create_damage_assessment(
    db: AsyncSession,
    data: DamageAssessmentCreate,
    user: User | None = None,
) -> DamageAssessment:
    """Create a new post-disaster damage assessment record."""
    score, priority_level, _ = calculate_recovery_priority_score(
        severity=data.severity,
        damage_category=data.damage_category,
        affected_population=data.affected_population,
    )

    assessment = DamageAssessment(
        field_report_id=data.field_report_id,
        title=data.title,
        district_id=data.district_id,
        location_name=data.location_name,
        damage_category=data.damage_category,
        severity=data.severity,
        priority_level=priority_level,
        recovery_score=score,
        affected_population=data.affected_population,
        estimated_cost_inr=data.estimated_cost_inr,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description,
        photo_url=data.photo_url,
        status="ASSESSED",
        assessed_by=user.id if user else None,
    )
    db.add(assessment)
    await db.flush()

    # Emit Notification
    notif_msg = f"POST-DISASTER [{priority_level}]: Damage Assessment registered for {data.title} at {data.location_name} (Priority Score: {score}/100)"
    notif = Notification(
        type="POST_DISASTER_ASSESSMENT",
        ref_id=assessment.id,
        ref_type="damage_assessment",
        message=notif_msg,
        severity=data.severity if data.severity in ("CRITICAL", "HIGH") else "MEDIUM",
    )
    db.add(notif)

    # Emit Audit Log
    audit = AuditLog(
        user_id=user.id if user else None,
        action="CREATE_DAMAGE_ASSESSMENT",
        entity="damage_assessment",
        entity_id=assessment.id,
        after_state={
            "title": data.title,
            "damage_category": data.damage_category,
            "recovery_score": score,
            "priority_level": priority_level,
            "status": "ASSESSED",
        },
    )
    db.add(audit)

    await db.commit()
    await db.refresh(assessment)
    return assessment


async def update_damage_assessment(
    db: AsyncSession,
    assessment_id: uuid.UUID,
    data: DamageAssessmentUpdate,
    user: User,
) -> DamageAssessment:
    """Update damage assessment status or details."""
    assessment = await get_damage_assessment(db, assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Damage assessment record not found.")

    before_state = {
        "status": assessment.status,
        "severity": assessment.severity,
        "recovery_score": assessment.recovery_score,
    }

    update_dict = data.model_dump(exclude_unset=True)
    old_status = assessment.status

    for key, value in update_dict.items():
        if value is not None:
            setattr(assessment, key, value)

    # Recalculate priority score if severity or population updated
    if "severity" in update_dict or "affected_population" in update_dict:
        score, prio_lvl, _ = calculate_recovery_priority_score(
            severity=assessment.severity,
            damage_category=assessment.damage_category,
            affected_population=assessment.affected_population,
        )
        assessment.recovery_score = score
        assessment.priority_level = prio_lvl

    # Emit Notification on status transition
    if data.status and data.status != old_status:
        notif = Notification(
            type=f"RECOVERY_{data.status}",
            ref_id=assessment.id,
            ref_type="damage_assessment",
            message=f"Restoration Status for '{assessment.title}' updated: {old_status} ──► {data.status}",
            severity="MEDIUM" if data.status != "RESTORED" else "LOW",
        )
        db.add(notif)

    # Emit Audit Log
    audit = AuditLog(
        user_id=user.id,
        action="UPDATE_RECOVERY_STATUS",
        entity="damage_assessment",
        entity_id=assessment.id,
        before_state=before_state,
        after_state=update_dict,
    )
    db.add(audit)

    await db.commit()
    await db.refresh(assessment)
    return assessment


async def start_recovery_assessment_from_field_report(
    db: AsyncSession,
    field_report_id: uuid.UUID,
    data: DamageAssessmentCreate,
    user: User,
) -> DamageAssessment:
    """Link a resolved/active Phase 2 FieldReport directly to a Phase 3 DamageAssessment."""
    report_result = await db.execute(select(FieldReport).where(FieldReport.id == field_report_id))
    report = report_result.scalar_one_or_none()

    data.field_report_id = field_report_id
    if report:
        data.district_id = report.district_id
        if not data.title:
            data.title = f"Post-Disaster Recovery: {report.title}"
        if not data.location_name:
            data.location_name = report.location_name
        data.latitude = report.latitude
        data.longitude = report.longitude

    return await create_damage_assessment(db, data, user)
