from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.schemas import ProfileCreate, ProfileUpdate, ProfileOut, SchemaIngestResponse
from app.services.profile_service import (
    create_profile, get_profile, list_profiles,
    update_profile, delete_profile, test_connection,
)
from app.services.schema_service import ingest_schema, get_profile_schema_structure
from app.core.security import get_current_user

router = APIRouter()


@router.post("", response_model=ProfileOut, status_code=201)
async def create(
    body: ProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await create_profile(db, body, current_user)


@router.get("", response_model=List[ProfileOut])
async def list_all(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await list_profiles(db, current_user)


@router.get("/{profile_id}", response_model=ProfileOut)
async def get_one(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = await get_profile(db, profile_id, current_user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/{profile_id}", response_model=ProfileOut)
async def update(
    profile_id: int,
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await update_profile(db, profile_id, body, current_user)


@router.delete("/{profile_id}", status_code=204)
async def delete(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    await delete_profile(db, profile_id, current_user)


@router.post("/{profile_id}/test")
async def test(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await test_connection(db, profile_id, current_user)


@router.post("/{profile_id}/ingest-schema", response_model=SchemaIngestResponse)
async def ingest(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await ingest_schema(db, profile_id, current_user)


@router.get("/{profile_id}/schema")
async def get_schema(
    profile_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_profile_schema_structure(db, profile_id, current_user)
