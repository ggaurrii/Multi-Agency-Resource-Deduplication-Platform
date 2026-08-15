from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2.elements import WKTElement

from app.models.resource import Resource
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceUpdate


async def list_resources(
    db: AsyncSession, filters: dict, page: int = 1, page_size: int = 20
) -> tuple[list[Resource], int]:
    """List resources with filtering by district_id, resource_type, status, agency_id. Returns (items, total_count)."""
    query = select(Resource)
    
    if filters.get("district_id"):
        query = query.where(Resource.district_id == filters["district_id"])
    if filters.get("resource_type"):
        query = query.where(Resource.resource_type == filters["resource_type"])
    if filters.get("status"):
        query = query.where(Resource.status == filters["status"])
    if filters.get("agency_id"):
        query = query.where(Resource.agency_id == filters["agency_id"])
        
    count_query = select(func.count()).select_from(query.subquery())
    total_count = await db.scalar(count_query)
    
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    
    return list(result.scalars().all()), total_count or 0


async def get_resource(db: AsyncSession, resource_id: UUID) -> Resource | None:
    """Get a single resource by ID."""
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    return result.scalar_one_or_none()


async def create_resource(db: AsyncSession, data: ResourceCreate) -> Resource:
    """Create a new resource. Sets quantity_reserved=0, quantity_in_transit=0. If lat/lng provided, creates PostGIS POINT."""
    resource_data = data.model_dump(exclude={"latitude", "longitude"})
    
    resource = Resource(**resource_data)
    resource.quantity_reserved = 0
    resource.quantity_in_transit = 0
    
    if data.latitude is not None and data.longitude is not None:
        resource.location = WKTElement(f"POINT({data.longitude} {data.latitude})", srid=4326)
        
    db.add(resource)
    await db.commit()
    await db.refresh(resource)
    return resource


async def update_resource(db: AsyncSession, resource_id: UUID, data: ResourceUpdate, user: User) -> Resource:
    """Update resource. Agency staff can only update their own agency's resources. Validates quantity invariant."""
    resource = await get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    if user.role in ("AGENCY_ADMIN", "AGENCY_STAFF"):
        if resource.agency_id != user.agency_id:
            raise HTTPException(status_code=403, detail="Forbidden: You can only update resources belonging to your agency")

    update_data = data.model_dump(exclude_unset=True, exclude={"latitude", "longitude"})
    
    for key, value in update_data.items():
        setattr(resource, key, value)
        
    if data.latitude is not None and data.longitude is not None:
        resource.location = WKTElement(f"POINT({data.longitude} {data.latitude})", srid=4326)

    # Validate quantity invariant
    if resource.quantity_available + resource.quantity_reserved + resource.quantity_in_transit > resource.quantity_total:
        raise HTTPException(
            status_code=400, 
            detail="Quantity invariant violated: available + reserved + in_transit cannot exceed total"
        )
        
    await db.commit()
    await db.refresh(resource)
    return resource
