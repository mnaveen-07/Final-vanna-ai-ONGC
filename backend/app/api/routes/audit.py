# audit.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.models.models import QueryLog
from app.core.security import get_current_user

router = APIRouter()

from sqlalchemy.orm import selectinload

@router.get("")
async def get_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5000, le=10000),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(QueryLog)
        .options(selectinload(QueryLog.user), selectinload(QueryLog.profile), selectinload(QueryLog.api_token))
        .order_by(desc(QueryLog.created_at))
        .offset(offset)
        .limit(page_size)
    )
    logs = result.scalars().all()
    output = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "natural_language_query": log.natural_language_query,
            "generated_sql": log.generated_sql,
            "execution_status": log.execution_status,
            "error_message": log.error_message,
            "row_count": log.row_count,
            "execution_time_ms": log.execution_time_ms,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "user": {"full_name": log.user.full_name, "username": log.user.username} if getattr(log, "user", None) else None,
            "profile": {"id": log.profile.id, "name": log.profile.name, "db_type": str(getattr(log.profile.db_type, "value", log.profile.db_type))} if getattr(log, "profile", None) else None,
            "api_token": {"id": log.api_token.id, "name": log.api_token.name, "prefix": log.api_token.token_prefix} if getattr(log, "api_token", None) else None,
            "db_profile": log.profile.db_type.value.capitalize() if getattr(log, "profile", None) and hasattr(log.profile.db_type, "value") else getattr(log, "profile", None) and str(log.profile.db_type).capitalize() or "Postgresql",
            "token_id": log.token_id,
        }
        output.append(log_dict)
    return output
