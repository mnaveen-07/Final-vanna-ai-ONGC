import asyncio
import sys
import os

# add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.services.schema_service import _extract_ddl
from app.models.models import ConnectionProfile, DatabaseType

async def test():
    # Test MySQL
    profile_mysql = ConnectionProfile(
        db_type=DatabaseType.MYSQL,
        host='mysql-test',
        port=3306,
        username='root',
        database_name='test_db',
        ssl_enabled=False
    )
    # fake encrypted password
    profile_mysql.encrypted_password = b"mysql_pass" # we will bypass decrypt_password
    
    # Test MongoDB
    profile_mongo = ConnectionProfile(
        db_type=DatabaseType.MONGODB,
        host='mongodb-test',
        port=27017,
        username='mongo_user',
        database_name='test_db',
        ssl_enabled=False
    )
    profile_mongo.encrypted_password = b"mongo_pass"

    print("Testing MySQL DDL Extraction...")
    try:
        ddls = await _extract_ddl(profile_mysql)
        print(f"MySQL DDLs: {ddls}")
    except Exception as e:
        print(f"MySQL Error: {e}")

    print("Testing MongoDB DDL Extraction...")
    try:
        ddls = await _extract_ddl(profile_mongo)
        print(f"MongoDB DDLs: {ddls}")
    except Exception as e:
        print(f"MongoDB Error: {e}")

if __name__ == "__main__":
    # monkey patch decrypt_password to just return the bytes decoded
    import app.services.crypto_service as cs
    cs.decrypt_password = lambda x: x.decode() if isinstance(x, bytes) else x
    
    asyncio.run(test())
