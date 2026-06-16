from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.models import ConnectionProfile, UserRole
from app.schemas.schemas import ProfileCreate, ProfileUpdate
from app.services.crypto_service import encrypt_password


async def create_profile(db: AsyncSession, data: ProfileCreate, user) -> ConnectionProfile:
    profile = ConnectionProfile(
        owner_id=user.id,
        name=data.name,
        db_type=data.db_type,
        host=data.host,
        port=data.port,
        database_name=data.database_name,
        username=data.username,
        encrypted_password=encrypt_password(data.password),
        ssl_enabled=data.ssl_enabled,
        read_only=data.read_only,
        allowed_schemas=data.allowed_schemas,
        allowed_tables=data.allowed_tables,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile


async def list_profiles(db: AsyncSession, user) -> list:
    if user.role in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        result = await db.execute(select(ConnectionProfile))
    else:
        result = await db.execute(
            select(ConnectionProfile).where(ConnectionProfile.owner_id == user.id)
        )
    return result.scalars().all()


async def get_profile(db: AsyncSession, profile_id: int, user):
    profile = await db.get(ConnectionProfile, profile_id)
    if not profile:
        return None
    if profile.owner_id != user.id and user.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Access denied")
    return profile


async def update_profile(db: AsyncSession, profile_id: int, data: ProfileUpdate, user):
    profile = await get_profile(db, profile_id, user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    for field, value in data.model_dump(exclude_none=True).items():
        if field == "password":
            profile.encrypted_password = encrypt_password(value)
        else:
            setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile


async def delete_profile(db: AsyncSession, profile_id: int, user):
    profile = await get_profile(db, profile_id, user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    from sqlalchemy import delete
    from app.models.models import QueryLog, APIToken, SchemaMetadata
    
    # Manually delete child records to avoid foreign key constraint errors
    await db.execute(delete(QueryLog).where(QueryLog.profile_id == profile_id))
    await db.execute(delete(APIToken).where(APIToken.profile_id == profile_id))
    await db.execute(delete(SchemaMetadata).where(SchemaMetadata.profile_id == profile_id))
    
    await db.delete(profile)
    await db.commit()


async def test_connection(db: AsyncSession, profile_id: int, user):
    from app.services.db_executor import execute_query_on_profile
    from app.services.crypto_service import decrypt_password
    profile = await get_profile(db, profile_id, user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    try:
        await execute_query_on_profile(profile, "SELECT 1")
        profile.connection_status = "connected"
        from datetime import datetime
        profile.last_tested_at = datetime.utcnow()
        await db.commit()
        return {"status": "connected", "message": "Connection successful"}
    except Exception as e:
        profile.connection_status = "failed"
        await db.commit()
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")
