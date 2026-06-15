"""
Dynamically connects to target databases (PostgreSQL, MySQL, MSSQL, Oracle, MongoDB)
based on connection profile configuration and executes read-only queries.
"""
from typing import Tuple, List, Dict, Any
from app.models.models import ConnectionProfile, DatabaseType
from app.services.crypto_service import decrypt_password


async def execute_query_on_profile(
    profile: ConnectionProfile,
    sql: str,
) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Route execution to the correct DB driver."""
    password = decrypt_password(profile.encrypted_password)

    if profile.db_type == DatabaseType.POSTGRESQL:
        return await _run_postgres(profile, sql, password)
    elif profile.db_type == DatabaseType.MYSQL:
        return await _run_mysql(profile, sql, password)
    elif profile.db_type == DatabaseType.MSSQL:
        return await _run_mssql(profile, sql, password)
    elif profile.db_type == DatabaseType.ORACLE:
        return await _run_oracle(profile, sql, password)
    elif profile.db_type == DatabaseType.MONGODB:
        return await _run_mongodb(profile, sql, password)
    else:
        raise ValueError(f"Unsupported database type: {profile.db_type}")


async def _run_postgres(profile, sql, password):
    import asyncpg
    ssl = "require" if profile.ssl_enabled else None
    conn = await asyncpg.connect(
        host=profile.host,
        port=profile.port,
        user=profile.username,
        password=password,
        database=profile.database_name,
        ssl=ssl,
    )
    try:
        rows = await conn.fetch(sql)
        if not rows:
            return [], []
        columns = list(rows[0].keys())
        data = [dict(r) for r in rows]
        return data, columns
    finally:
        await conn.close()


async def _run_mysql(profile, sql, password):
    import aiomysql
    conn = await aiomysql.connect(
        host=profile.host,
        port=profile.port,
        user=profile.username,
        password=password,
        db=profile.database_name,
        ssl={"ssl": {}} if profile.ssl_enabled else None,
    )
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql)
            rows = await cur.fetchall()
            columns = [d[0] for d in cur.description] if cur.description else []
            return list(rows), columns
    finally:
        conn.close()


async def _run_mssql(profile, sql, password):
    import aioodbc
    conn_str = (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={profile.host},{profile.port};"
        f"DATABASE={profile.database_name};"
        f"UID={profile.username};PWD={password};"
        f"TrustServerCertificate={'yes' if not profile.ssl_enabled else 'no'};"
    )
    async with await aioodbc.connect(dsn=conn_str) as conn:
        async with conn.cursor() as cur:
            await cur.execute(sql)
            columns = [col[0] for col in cur.description] if cur.description else []
            rows_raw = await cur.fetchall()
            rows = [dict(zip(columns, row)) for row in rows_raw]
            return rows, columns


async def _run_oracle(profile, sql, password):
    import oracledb
    import asyncio
    dsn = f"{profile.host}:{profile.port}/{profile.database_name}"
    loop = asyncio.get_event_loop()

    def _sync_query():
        with oracledb.connect(user=profile.username, password=password, dsn=dsn) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                if not cur.description:
                    return [], []
                columns = [col[0] for col in cur.description]
                rows = [dict(zip(columns, row)) for row in cur.fetchall()]
                return rows, columns

    return await loop.run_in_executor(None, _sync_query)


async def _run_mongodb(profile, sql, password):
    import motor.motor_asyncio
    uri = f"mongodb://{profile.username}:{password}@{profile.host}:{profile.port}/{profile.database_name}"
    client = motor.motor_asyncio.AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    db = client[profile.database_name]
    
    try:
        # Simple test connection bypass
        if sql.strip().upper() == "SELECT 1":
            await db.command("ping")
            return [{"status": "connected"}], ["status"]
        
        # Experimental execution (assuming sql is JSON)
        import json
        pipeline = json.loads(sql)
        cursor = db.get_collection(profile.database_name).aggregate(pipeline)
        rows = await cursor.to_list(length=100)
        if not rows:
            return [], []
        columns = list(rows[0].keys())
        return rows, columns
    finally:
        client.close()
