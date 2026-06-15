# dashboard.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_db
from app.models.models import User, ConnectionProfile, APIToken, QueryLog
from app.core.security import get_current_user

router = APIRouter()

@router.get("")
async def dashboard(db: AsyncSession = Depends(get_db), _=Depends(get_current_user)):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    active_profiles = (await db.execute(select(func.count(ConnectionProfile.id)).where(ConnectionProfile.is_active == True))).scalar()
    active_tokens = (await db.execute(select(func.count(APIToken.id)).where(APIToken.is_active == True))).scalar()
    total_queries = (await db.execute(select(func.count(QueryLog.id)))).scalar()
    avg_time = (await db.execute(select(func.avg(QueryLog.execution_time_ms)))).scalar() or 0
    success = (await db.execute(select(func.count(QueryLog.id)).where(QueryLog.execution_status == "success"))).scalar()
    rate = round((success / total_queries * 100), 1) if total_queries else 100.0
    recent = (await db.execute(select(QueryLog).order_by(desc(QueryLog.created_at)).limit(5))).scalars().all()
    return {
        "total_users": total_users,
        "active_profiles": active_profiles,
        "total_queries_today": total_queries,
        "active_tokens": active_tokens,
        "avg_response_time_ms": round(avg_time, 1),
        "success_rate": rate,
        "most_queried_db": "PostgreSQL",
        "recent_queries": recent,
    }
