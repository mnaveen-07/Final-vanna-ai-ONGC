from fastapi import HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import hashlib

from app.models.models import APIToken, ConnectionProfile
from app.schemas.schemas import APITokenCreate
from app.core.security import generate_api_token


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


async def create_api_token(db: AsyncSession, body: APITokenCreate, current_user) -> dict:
    # Verify profile belongs to user
    profile = await db.get(ConnectionProfile, body.profile_id)
    if not profile or (profile.owner_id != current_user.id and current_user.role not in ("super_admin", "admin")):
        raise HTTPException(status_code=404, detail="Profile not found")

    raw_token = generate_api_token()
    token_hash = _hash_token(raw_token)

    db_token = APIToken(
        owner_id=current_user.id,
        profile_id=body.profile_id,
        name=body.name,
        token_hash=token_hash,
        token_prefix=raw_token[:10],
        rate_limit_per_minute=body.rate_limit_per_minute,
        expires_at=body.expires_at,
    )
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)

    result = {**db_token.__dict__}
    result["token"] = raw_token
    return result


async def validate_api_token_from_request(request: Request, db: AsyncSession) -> APIToken:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")
    raw_token = auth_header.split(" ", 1)[1]
    token_hash = _hash_token(raw_token)

    result = await db.execute(
        select(APIToken).where(APIToken.token_hash == token_hash, APIToken.is_active == True)
    )
    token = result.scalar_one_or_none()
    if not token:
        raise HTTPException(status_code=401, detail="Invalid or revoked API token")

    if token.expires_at and token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API token has expired")

    # Update usage
    token.last_used_at = datetime.utcnow()
    token.usage_count = (token.usage_count or 0) + 1
    await db.commit()

    # Eagerly load profile
    await db.refresh(token, ["profile"])
    return token


async def list_tokens(db: AsyncSession, current_user) -> list:
    result = await db.execute(
        select(APIToken).where(APIToken.owner_id == current_user.id)
    )
    return result.scalars().all()


async def revoke_token(db: AsyncSession, token_id: int, current_user) -> None:
    token = await db.get(APIToken, token_id)
    if not token or token.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Token not found")
    token.is_active = False
    await db.commit()


async def rotate_token(db: AsyncSession, token_id: int, current_user) -> dict:
    token = await db.get(APIToken, token_id)
    if not token or token.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Token not found")
    token.is_active = False

    raw_token = generate_api_token()
    new_token = APIToken(
        owner_id=token.owner_id,
        profile_id=token.profile_id,
        name=token.name + " (rotated)",
        token_hash=_hash_token(raw_token),
        token_prefix=raw_token[:10],
        rate_limit_per_minute=token.rate_limit_per_minute,
        expires_at=token.expires_at,
    )
    db.add(new_token)
    await db.commit()
    await db.refresh(new_token)

    result = {**new_token.__dict__}
    result["token"] = raw_token
    return result


async def get_token_usage(db: AsyncSession, token_id: int, current_user) -> dict:
    token = await db.get(APIToken, token_id)
    if not token or token.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Token not found")
    return {
        "token_id": token.id,
        "usage_count": token.usage_count,
        "last_used_at": token.last_used_at,
        "rate_limit_per_minute": token.rate_limit_per_minute,
    }
