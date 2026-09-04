"""
SAHAYOG — FieldReports API router.

Endpoints:
- GET  /api/v1/field-reports
- POST /api/v1/field-reports
- GET  /api/v1/field-reports/{id}
- PATCH /api/v1/field-reports/{id}
- POST /api/v1/field-reports/{id}/convert-to-need
"""

from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.field_report import (
    FieldReportCreate,
    FieldReportUpdate,
    FieldReportConvertToNeed,
    FieldReportResponse,
    FieldReportListResponse,
)
from app.schemas.need import NeedResponse
from app.services.field_report_service import (
    list_field_reports,
    get_field_report,
    create_field_report,
    update_field_report,
    convert_field_report_to_need,
)

router = APIRouter(prefix="/field-reports", tags=["Field Reports"])


def _serialize_report(report) -> dict:
    """Helper to format FieldReport model to response dict including nested names."""
    return {
        "id": str(report.id),
        "title": report.title,
        "disaster_type": report.disaster_type,
        "severity": report.severity,
        "district_id": str(report.district_id),
        "district_name": report.district.name if getattr(report, "district", None) else "Kota",
        "location_name": report.location_name,
        "latitude": report.latitude,
        "longitude": report.longitude,
        "description": report.description,
        "photo_url": report.photo_url,
        "status": report.status,
        "reported_by": str(report.reported_by) if report.reported_by else None,
        "reporter_name": report.reporter.name if getattr(report, "reporter", None) else None,
        "linked_need_id": str(report.linked_need_id) if report.linked_need_id else None,
        "created_at": report.created_at,
        "updated_at": report.updated_at,
    }


@router.get("/", response_model=FieldReportListResponse)
async def list_reports_endpoint(
    district_id: Optional[UUID] = Query(None, description="Filter by district UUID"),
    severity: Optional[str] = Query(None, description="Filter by CRITICAL|HIGH|MEDIUM|LOW"),
    disaster_type: Optional[str] = Query(None, description="Filter by FLOOD|LANDSLIDE|etc"),
    status: Optional[str] = Query(None, description="Filter by SUBMITTED|VERIFIED|RESPONDED|RESOLVED"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List ground incident field reports with filtering and pagination."""
    filters = {
        "district_id": district_id,
        "severity": severity,
        "disaster_type": disaster_type,
        "status": status,
    }
    items, total = await list_field_reports(db, filters, page, page_size)
    serialized = [_serialize_report(r) for r in items]
    return FieldReportListResponse(
        items=serialized,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{report_id}", response_model=FieldReportResponse)
async def get_report_endpoint(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single field report by ID."""
    report = await get_field_report(db, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Field report not found.")
    return _serialize_report(report)


@router.post("/", response_model=FieldReportResponse, status_code=status.HTTP_201_CREATED)
async def create_report_endpoint(
    data: FieldReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit a new field incident report."""
    report = await create_field_report(db, data, current_user)
    return _serialize_report(report)


@router.patch("/{report_id}", response_model=FieldReportResponse)
async def update_report_endpoint(
    report_id: UUID,
    data: FieldReportUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")
    ),
):
    """Update status or severity of a field report."""
    report = await update_field_report(db, report_id, data, current_user)
    return _serialize_report(report)


@router.post("/{report_id}/convert-to-need", response_model=FieldReportResponse)
async def convert_report_to_need_endpoint(
    report_id: UUID,
    need_data: FieldReportConvertToNeed,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")
    ),
):
    """Convert/link a field incident report directly to a Need Requisition."""
    report, need = await convert_field_report_to_need(db, report_id, need_data, current_user)
    return _serialize_report(report)
