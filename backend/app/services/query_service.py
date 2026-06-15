"""
Core query service: validates the API token's profile, calls the Vanna AI service
for SQL generation, runs read-only SQL against the target database, and logs results.
"""
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import time

from app.core.config import settings
from app.models.models import APIToken, QueryLog, DatabaseType
from app.services.db_executor import execute_query_on_profile
from app.services.audit_service import log_query


BLOCKED_KEYWORDS = {
    "insert", "update", "delete", "drop", "alter",
    "truncate", "exec", "execute", "create", "grant",
    "revoke", "merge", "upsert",
}


def validate_sql_safety(sql: str) -> None:
    """Raise if generated SQL contains write operations."""
    lower = sql.lower().strip()
    for kw in BLOCKED_KEYWORDS:
        if lower.startswith(kw) or f" {kw} " in lower:
            raise ValueError(f"Blocked operation detected: {kw.upper()}")


async def call_vanna_service(question: str, profile_id: int) -> dict:
    """Call the Vanna AI microservice to convert NL → SQL."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{settings.VANNA_SERVICE_URL}/generate-sql",
            json={"question": question, "profile_id": profile_id},
        )
        if not resp.is_success:
            try:
                err = resp.json().get("detail", resp.text)
            except:
                err = resp.text
            raise ValueError(err)
        return resp.json()


async def execute_natural_language_query(
    db: AsyncSession,
    question: str,
    api_token: APIToken,
    client_ip: str,
) -> dict:
    profile = api_token.profile
    status = "failed"
    generated_sql = None
    summary = ""
    rows = []
    error_msg = None
    row_count = 0
    start = time.perf_counter()

    try:
        # 1. Generate SQL via Vanna
        vanna_result = await call_vanna_service(question, profile.id)
        generated_sql = vanna_result.get("sql", "")
        explanation = vanna_result.get("explanation", "")

        # 2. Safety check
        validate_sql_safety(generated_sql)

        # 3. Execute against target DB
        try:
            rows, columns = await execute_query_on_profile(profile, generated_sql)
            row_count = len(rows)
        except Exception as db_err:
            # If the LLM generated english instead of SQL, the DB will reject it.
            raise ValueError(f"Failed to execute query. The AI may not have generated valid SQL. DB Error: {db_err}")

        # 4. Get summary from Vanna
        summary = vanna_result.get("summary") or f"Query returned {row_count} result(s)."
        status = "success"

    except ValueError as e:
        error_msg = str(e)
        status = "blocked"
        raise
    except Exception as e:
        error_msg = str(e)
        status = "failed"
        raise
    finally:
        elapsed_ms = (time.perf_counter() - start) * 1000
        await log_query(
            db=db,
            token_id=api_token.id,
            profile_id=profile.id,
            question=question,
            generated_sql=generated_sql,
            status=status,
            error_message=error_msg,
            row_count=row_count,
            execution_time_ms=elapsed_ms,
            ip_address=client_ip,
            user_id=api_token.owner_id,
        )

    return {
        "question": question,
        "generated_sql": generated_sql,
        "summary": summary,
        "data": rows,
        "row_count": row_count,
        "columns": columns,
        "execution_time_ms": 0,  # Overwritten by caller
    }


async def preview_sql(
    db: AsyncSession,
    question: str,
    api_token: APIToken,
) -> dict:
    vanna_result = await call_vanna_service(question, api_token.profile.id)
    generated_sql = vanna_result.get("sql", "")
    validate_sql_safety(generated_sql)
    return {
        "question": question,
        "generated_sql": generated_sql,
        "explanation": vanna_result.get("explanation", ""),
    }
