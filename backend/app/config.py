import os
from typing import List

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./manas.db")
        JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "manas_sih_2026_super_secret_jwt_key_987654321")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
        REFRESH_TOKEN_EXPIRE_DAYS: int = 7
        CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        AUTO_SEED: bool = os.getenv("AUTO_SEED", "true").lower() in ("true", "1", "yes")

        model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

        @property
        def cors_origins_list(self) -> List[str]:
            if not self.CORS_ORIGINS or self.CORS_ORIGINS.strip() == "*":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    settings = Settings()

except ImportError:
    class FallbackSettings:
        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./manas.db")
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
