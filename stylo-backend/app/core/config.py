from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), env_file_encoding="utf-8")

    # Gemini AI
    gemini_api_key: str = ""

    # App
    app_env: str = "development"
    allowed_origins: list[str] = [
        "https://stylo-zeta.vercel.app",
        "https://*.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Database (SQLite locally, swap for postgresql:// on Railway)
    database_url: str = "sqlite:///./stylo.db"

    # JWT — must be overridden via JWT_SECRET_KEY env var in production
    jwt_secret_key: str = "change-me-in-production-use-a-long-random-string"

    # MongoDB (Phase 2)
    mongodb_url: str = "mongodb://localhost:27017"

    # SerpApi (Phase 2 real data)
    serpapi_key: str = ""


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
