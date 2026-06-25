"""
Schema ingestion: discovers tables and columns from target DB,
stores metadata, and trains Vanna with DDL.
"""
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.services.profile_service import get_profile
from app.services.crypto_service import decrypt_password
from app.core.config import settings
from app.models.models import DatabaseType, SchemaMetadata
from datetime import datetime


async def ingest_schema(db: AsyncSession, profile_id: int, user):
    profile = await get_profile(db, profile_id, user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    ddl_statements = await _extract_ddl(profile)

    # Push to Vanna
    async with httpx.AsyncClient(timeout=60.0) as client:
        await client.post(
            f"{settings.VANNA_SERVICE_URL}/ingest-schema",
            json={"profile_id": profile_id, "ddl_statements": ddl_statements},
        )

    profile.schema_ingested_at = datetime.utcnow()
    await db.commit()

    return {
        "profile_id": profile_id,
        "tables_discovered": len(ddl_statements),
        "columns_discovered": sum(ddl.count("\n") for ddl in ddl_statements),
        "message": f"Schema ingested and Vanna trained with {len(ddl_statements)} tables.",
    }


async def _extract_ddl(profile) -> list[str]:
    """Extract CREATE TABLE DDL from the target database."""
    from app.services.db_executor import execute_query_on_profile

    if profile.db_type == DatabaseType.POSTGRESQL:
        rows, _ = await execute_query_on_profile(profile, _PG_DDL_QUERY)
    elif profile.db_type == DatabaseType.MYSQL:
        rows, _ = await execute_query_on_profile(profile, _MYSQL_DDL_QUERY)
    elif profile.db_type == DatabaseType.MSSQL:
        rows, _ = await execute_query_on_profile(profile, _MSSQL_DDL_QUERY)
    elif profile.db_type == DatabaseType.ORACLE:
        rows, _ = await execute_query_on_profile(profile, _ORACLE_DDL_QUERY)
    elif profile.db_type == DatabaseType.MONGODB:
        rows, _ = await execute_query_on_profile(profile, "__GET_SCHEMA__")
    else:
        return []

    return [row.get("ddl", "") or row.get("DDL", "") for row in rows if row.get("ddl") or row.get("DDL")]


_ORACLE_DDL_QUERY = """
SELECT
  'CREATE TABLE ' || table_name || ' (' ||
  LISTAGG(column_name || ' ' || data_type, ', ') WITHIN GROUP (ORDER BY column_id) || ');' AS ddl
FROM user_tab_columns
GROUP BY table_name
"""


_PG_DDL_QUERY = """
SELECT
  'CREATE TABLE ' || quote_ident(table_schema) || '.' || quote_ident(table_name) || ' (' ||
  string_agg(quote_ident(column_name) || ' ' || data_type, ', ') || ');' AS ddl
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema, table_name
"""

_MYSQL_DDL_QUERY = """
SELECT CONCAT(
  'CREATE TABLE ', table_name, ' (',
  GROUP_CONCAT(CONCAT(column_name, ' ', column_type) SEPARATOR ', '),
  ');'
) AS ddl
FROM information_schema.columns
WHERE table_schema = DATABASE()
GROUP BY table_name
"""

_MSSQL_DDL_QUERY = """
SELECT
  'CREATE TABLE ' + t.name + ' (' +
  STRING_AGG(c.name + ' ' + tp.name, ', ') + ');' AS ddl
FROM sys.tables t
JOIN sys.columns c ON c.object_id = t.object_id
JOIN sys.types tp ON tp.user_type_id = c.user_type_id
GROUP BY t.name
"""

async def get_profile_schema_structure(db: AsyncSession, profile_id: int, user):
    profile = await get_profile(db, profile_id, user)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    from app.services.db_executor import execute_query_on_profile
    from collections import defaultdict

    if profile.db_type == DatabaseType.POSTGRESQL:
        rows, _ = await execute_query_on_profile(profile, _PG_SCHEMA_QUERY)
    elif profile.db_type == DatabaseType.MYSQL:
        rows, _ = await execute_query_on_profile(profile, _MYSQL_SCHEMA_QUERY)
    elif profile.db_type == DatabaseType.MSSQL:
        rows, _ = await execute_query_on_profile(profile, _MSSQL_SCHEMA_QUERY)
    elif profile.db_type == DatabaseType.ORACLE:
        rows, _ = await execute_query_on_profile(profile, _ORACLE_SCHEMA_QUERY)
    elif profile.db_type == DatabaseType.MONGODB:
        rows, _ = await execute_query_on_profile(profile, "__GET_SCHEMA__")
        structured = []
        for row in rows:
            ddl = row.get("ddl", "") or row.get("DDL", "")
            if ddl.upper().startswith("CREATE TABLE "):
                table_part = ddl[13:]
                table_name = table_part.split(" (")[0]
                cols_part = table_part.split(" (")[1].replace(");", "")
                cols = cols_part.split(", ")
                columns = [{"name": c.split(" ")[0], "data_type": c.split(" ")[1] if " " in c else "unknown"} for c in cols if c]
                structured.append({"name": table_name, "columns": columns})
        return structured
    else:
        return []

    tables_map = defaultdict(list)
    for row in rows:
        t_name = row.get("table_name") or row.get("TABLE_NAME")
        c_name = row.get("column_name") or row.get("COLUMN_NAME")
        d_type = row.get("data_type") or row.get("DATA_TYPE")
        if t_name and c_name:
            tables_map[t_name].append({"name": c_name, "data_type": d_type})
            
    structured = [{"name": k, "columns": v} for k, v in tables_map.items()]
    return structured

_PG_SCHEMA_QUERY = """
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_name, ordinal_position
"""

_MYSQL_SCHEMA_QUERY = """
SELECT table_name, column_name, column_type as data_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
ORDER BY table_name, ordinal_position
"""

_MSSQL_SCHEMA_QUERY = """
SELECT t.name as table_name, c.name as column_name, tp.name as data_type
FROM sys.tables t
JOIN sys.columns c ON c.object_id = t.object_id
JOIN sys.types tp ON tp.user_type_id = c.user_type_id
ORDER BY t.name, c.column_id
"""

_ORACLE_SCHEMA_QUERY = """
SELECT table_name, column_name, data_type
FROM user_tab_columns
ORDER BY table_name, column_id
"""
