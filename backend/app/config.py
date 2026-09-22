import os
from typing import List

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CANONICAL_DB_FILE = os.path.join(BACKEND_DIR, "manas.db").replace("\\", "/")
DEFAULT_DATABASE_URL = f"sqlite:///{CANONICAL_DB_FILE}"
ENV_FILE_PATH = os.path.join(BACKEND_DIR, ".env")

def get_clean_database_url() -> str:
    raw = os.getenv("DATABASE_URL", "")
    if not raw or "[YOUR_PASSWORD]" in raw or raw.strip() == "sqlite:///./manas.db":
        return DEFAULT_DATABASE_URL
    if raw.startswith("sqlite:///./"):
        return f"sqlite:///{CANONICAL_DB_FILE}"
    return raw

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    from pydantic import field_validator

    class Settings(BaseSettings):
        DATABASE_URL: str = DEFAULT_DATABASE_URL
        JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "manas_sih_2026_super_secret_jwt_key_987654321")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
        REFRESH_TOKEN_EXPIRE_DAYS: int = 7
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        AUTO_SEED: bool = os.getenv("AUTO_SEED", "true").lower() in ("true", "1", "yes")

        model_config = SettingsConfigDict(env_file=ENV_FILE_PATH, env_file_encoding="utf-8", extra="ignore")

        @field_validator("DATABASE_URL", mode="after")
        @classmethod
        def clean_db_url(cls, v: str) -> str:
            if not v or "[YOUR_PASSWORD]" in v or v.strip() == "sqlite:///./manas.db":
                return DEFAULT_DATABASE_URL
            if v.startswith("sqlite:///./"):
                return f"sqlite:///{CANONICAL_DB_FILE}"
            return v

        @property
        def cors_origins_list(self) -> List[str]:
            if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    settings = Settings()

except ImportError:
    class FallbackSettings:
        DATABASE_URL: str = get_clean_database_url()
        JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "manas_sih_2026_super_secret_jwt_key_987654321")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
        REFRESH_TOKEN_EXPIRE_DAYS: int = 7
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        AUTO_SEED: bool = os.getenv("AUTO_SEED", "true").lower() in ("true", "1", "yes")

        @property
        def cors_origins_list(self) -> List[str]:
            if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    settings = FallbackSettings()
