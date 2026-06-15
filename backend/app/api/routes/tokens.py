from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.schemas.schemas import APITokenCreate, APITokenOut, APITokenCreated
from app.services.token_service import (
    create_api_token, list_tokens, revoke_token,
    rotate_token, get_token_usage,
)
from app.core.security import get_current_user

router = APIRouter()


@router.post("", response_model=APITokenCreated, status_code=201)
async def create_token(
    body: APITokenCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generate a new API token bound to a database profile.
    The raw token is shown ONCE. Store it securely.
    """
    return await create_api_token(db, body, current_user)


@router.get("", response_model=List[APITokenOut])
async def list_all_tokens(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await list_tokens(db, current_user)


@router.delete("/{token_id}", status_code=204)
async def revoke(
    token_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    await revoke_token(db, token_id, current_user)


@router.post("/{token_id}/rotate", response_model=APITokenCreated)
async def rotate(
    token_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Revoke current token and issue a fresh one with same settings."""
    return await rotate_token(db, token_id, current_user)


@router.get("/{token_id}/usage")
async def usage(
    token_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await get_token_usage(db, token_id, current_user)
