from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine
from app.db.base import Base
from app.api.routes import (
    auth,
    users,
    profiles,
    tokens,
    query,
    audit,
    dashboard,
    schema_ingestion,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Vanna AI Database Query Platform",
    description="Centralized AI-Powered Database Query Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["Connection Profiles"])
app.include_router(tokens.router, prefix="/api/tokens", tags=["API Tokens"])
app.include_router(query.router, prefix="/api/query", tags=["Query Engine"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Logs"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(schema_ingestion.router, prefix="/api/schema", tags=["Schema Ingestion"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "vanna-platform-api"}
