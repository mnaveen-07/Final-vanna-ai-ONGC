# schema_ingestion.py route
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import get_current_user
from app.services.schema_service import ingest_schema

router = APIRouter()

@router.post("/{profile_id}/ingest")
async def ingest(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await ingest_schema(db, profile_id, current_user)
