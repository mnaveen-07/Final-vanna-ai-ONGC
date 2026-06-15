from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.models import QueryLog
from typing import Optional


async def log_query(
    db: AsyncSession,
    token_id: Optional[int],
    profile_id: int,
    question: str,
    generated_sql: Optional[str],
    status: str,
    error_message: Optional[str] = None,
    row_count: int = 0,
    execution_time_ms: float = 0,
    ip_address: Optional[str] = None,
    user_id: Optional[int] = None,
):
    log = QueryLog(
        token_id=token_id,
        user_id=user_id,
        profile_id=profile_id,
        natural_language_query=question,
        generated_sql=generated_sql,
        execution_status=status,
        error_message=error_message,
        row_count=row_count,
        execution_time_ms=execution_time_ms,
        ip_address=ip_address,
    )
    db.add(log)
    await db.commit()


async def get_user_query_history(db: AsyncSession, user_id: int, page: int, page_size: int):
    offset = (page - 1) * page_size
    result = await db.execute(
        select(QueryLog)
        .where(QueryLog.user_id == user_id)
        .order_by(desc(QueryLog.created_at))
        .offset(offset)
        .limit(page_size)
    )
    return result.scalars().all()
