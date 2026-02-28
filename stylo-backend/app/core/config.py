from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Gemini AI
    gemini_api_key: str = ""

    # App
    app_env: str = "development"
    allowed_origins: list[str] = ["*"]

    # Database (SQLite locally, swap for postgresql:// on Railway)
    database_url: str = "sqlite:///./stylo.db"

    # JWT
    jwt_secret_key: str = "change-me-in-production-use-a-long-random-string"

    # MongoDB (Phase 2)
    mongodb_url: str = "mongodb://localhost:27017"

    # SerpApi (Phase 2 real data)
    serpapi_key: str = ""


def get_settings() -> Settings:
    return Settings()

settings = get_settings()
