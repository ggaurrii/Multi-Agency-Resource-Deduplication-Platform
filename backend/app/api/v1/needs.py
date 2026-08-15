from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.need import NeedCreate, NeedListResponse, NeedResponse, NeedUpdate
from app.services import need_service

router = APIRouter(tags=["Needs"])


@router.get("/", response_model=NeedListResponse)
async def list_needs(
    district_id: UUID | None = None,
    resource_type: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filters = {
        "district_id": district_id,
        "resource_type": resource_type,
        "status": status,
        "priority": priority,
    }
    # Clean None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    items, total = await need_service.list_needs(db, filters, page, page_size)
    return NeedListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{need_id}", response_model=NeedResponse)
async def get_need(
    need_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    need = await need_service.get_need(db, need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Need not found")
    return need


@router.post("/", response_model=NeedResponse, status_code=status.HTTP_201_CREATED)
async def create_need(
    data: NeedCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")),
):
    need = await need_service.create_need(db, data, current_user)
    return need


@router.patch("/{need_id}", response_model=NeedResponse)
async def update_need(
    need_id: UUID,
    data: NeedUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("SUPER_ADMIN", "STATE_OPERATOR", "AGENCY_ADMIN", "AGENCY_STAFF")),
):
    need = await need_service.get_need(db, need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Need not found")
        
    if current_user.role not in ["SUPER_ADMIN", "STATE_OPERATOR"] and need.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this need")
        
    updated_need = await need_service.update_need(db, need_id, data, current_user)
    return updated_need
