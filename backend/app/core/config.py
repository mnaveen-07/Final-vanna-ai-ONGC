from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Vanna AI Platform"
    SECRET_KEY: str = "changeme_super_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8  # 8 hours

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://vanna_user:vanna_pass@localhost:5432/vanna_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Vanna Service
    VANNA_SERVICE_URL: str = "http://localhost:8001"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Encryption
    ENCRYPTION_KEY: str = "base64_encoded_32_byte_key_here=="

    class Config:
        env_file = ".env"


settings = Settings()
