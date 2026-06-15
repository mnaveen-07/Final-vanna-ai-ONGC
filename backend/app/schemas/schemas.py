from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.models import UserRole, DatabaseType


# ─── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


# ─── User ────────────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


# ─── Connection Profile ───────────────────────────────────────────────────────

class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    db_type: DatabaseType
    host: str
    port: int
    database_name: str
    username: str
    password: str
    ssl_enabled: bool = False
    read_only: bool = True
    allowed_schemas: List[str] = []
    allowed_tables: List[str] = []

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    database_name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    ssl_enabled: Optional[bool] = None
    allowed_schemas: Optional[List[str]] = None
    allowed_tables: Optional[List[str]] = None

class ProfileOut(BaseModel):
    id: int
    name: str
    db_type: DatabaseType
    host: str
    port: int
    database_name: str
    username: str
    ssl_enabled: bool
    read_only: bool
    allowed_schemas: List[str]
    allowed_tables: List[str]
    is_active: bool
    connection_status: str
    last_tested_at: Optional[datetime]
    schema_ingested_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── API Token ────────────────────────────────────────────────────────────────

class APITokenCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    profile_id: int
    rate_limit_per_minute: int = Field(default=60, ge=1, le=1000)
    expires_at: Optional[datetime] = None

class APITokenOut(BaseModel):
    id: int
    name: str
    token_prefix: str
    profile_id: int
    is_active: bool
    rate_limit_per_minute: int
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    usage_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class APITokenCreated(APITokenOut):
    token: str  # Only shown once at creation


# ─── Query ────────────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str = Field(..., min_length=3, max_length=2000)

class QueryResponse(BaseModel):
    question: str
    generated_sql: str
    summary: str
    data: List[Dict[str, Any]]
    row_count: int
    execution_time_ms: float
    columns: List[str]

class QueryPreviewRequest(BaseModel):
    question: str

class QueryPreviewResponse(BaseModel):
    question: str
    generated_sql: str
    explanation: str


# ─── Audit ────────────────────────────────────────────────────────────────────

class QueryLogOut(BaseModel):
    id: int
    natural_language_query: str
    generated_sql: Optional[str]
    execution_status: str
    error_message: Optional[str]
    row_count: Optional[int]
    execution_time_ms: Optional[float]
    ip_address: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_users: int
    active_profiles: int
    total_queries_today: int
    active_tokens: int
    avg_response_time_ms: float
    success_rate: float
    most_queried_db: Optional[str]
    recent_queries: List[QueryLogOut]


# ─── Schema ───────────────────────────────────────────────────────────────────

class SchemaIngestResponse(BaseModel):
    profile_id: int
    tables_discovered: int
    columns_discovered: int
    message: str
