from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text,
    ForeignKey, Enum, JSON, Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"


class DatabaseType(str, enum.Enum):
    POSTGRESQL = "postgresql"
    MYSQL = "mysql"
    MSSQL = "mssql"
    ORACLE = "oracle"
    MONGODB = "mongodb"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profiles = relationship("ConnectionProfile", back_populates="owner")
    api_tokens = relationship("APIToken", back_populates="owner")


class ConnectionProfile(Base):
    __tablename__ = "connection_profiles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    db_type = Column(Enum(DatabaseType), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    database_name = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    encrypted_password = Column(Text, nullable=False)
    ssl_enabled = Column(Boolean, default=False)
    read_only = Column(Boolean, default=True)
    allowed_schemas = Column(JSON, default=list)
    allowed_tables = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    last_tested_at = Column(DateTime(timezone=True))
    connection_status = Column(String(50), default="untested")
    schema_ingested_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="profiles")
    api_tokens = relationship("APIToken", back_populates="profile")

    @property
    def password(self) -> str:
        from app.services.crypto_service import decrypt_password
        try:
            return decrypt_password(self.encrypted_password)
        except Exception:
            return ""


class APIToken(Base):
    __tablename__ = "api_tokens"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    profile_id = Column(Integer, ForeignKey("connection_profiles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    token_prefix = Column(String(10), nullable=False)  # First 8 chars for display
    is_active = Column(Boolean, default=True)
    rate_limit_per_minute = Column(Integer, default=60)
    expires_at = Column(DateTime(timezone=True))
    last_used_at = Column(DateTime(timezone=True))
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="api_tokens")
    profile = relationship("ConnectionProfile", back_populates="api_tokens")
    query_logs = relationship("QueryLog", back_populates="api_token")


class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(Integer, ForeignKey("api_tokens.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    profile_id = Column(Integer, ForeignKey("connection_profiles.id"))
    natural_language_query = Column(Text, nullable=False)
    generated_sql = Column(Text)
    execution_status = Column(String(50))  # success, failed, blocked
    error_message = Column(Text)
    row_count = Column(Integer)
    execution_time_ms = Column(Float)
    ip_address = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    api_token = relationship("APIToken", back_populates="query_logs")
    user = relationship("User")
    profile = relationship("ConnectionProfile")


class SchemaMetadata(Base):
    __tablename__ = "schema_metadata"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("connection_profiles.id"), nullable=False)
    schema_name = Column(String(255))
    table_name = Column(String(255), nullable=False)
    column_name = Column(String(255), nullable=False)
    data_type = Column(String(100))
    is_nullable = Column(Boolean, default=True)
    is_primary_key = Column(Boolean, default=False)
    is_foreign_key = Column(Boolean, default=False)
    business_description = Column(Text)
    sample_values = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
