from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.resource import (
    ResourceCreate,
    ResourceListResponse,
    ResourceResponse,
    ResourceType,
    ResourceUpdate,
    PooledResourceResponse,
)
from app.algorithms.deduplication import pool_resources
from app.services import resource_service

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/", response_model=ResourceListResponse)
async def list_resources(
    district_id: Optional[UUID] = Query(None),
    resource_type: Optional[ResourceType] = Query(None),
    status: Optional[str] = Query(None),
    agency_id: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = {
        "district_id": district_id,
        "resource_type": resource_type,
        "status": status,
        "agency_id": agency_id,
    }
    filters = {k: v for k, v in filters.items() if v is not None}

    items, total = await resource_service.list_resources(db, filters, page, page_size)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/pooled", response_model=list[PooledResourceResponse])
async def get_pooled_resources(
    district_id: Optional[UUID] = Query(None),
    resource_type: Optional[ResourceType] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await pool_resources(db, district_id=district_id, resource_type=resource_type)


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resource = await resource_service.get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    data: ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")),
):
    if current_user.role in ("AGENCY_ADMIN", "AGENCY_STAFF"):
        data.agency_id = current_user.agency_id

    return await resource_service.create_resource(db, data)


@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: UUID,
    data: ResourceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")),
):
    return await resource_service.update_resource(db, resource_id, data, current_user)
