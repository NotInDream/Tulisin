from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="TULISIN_",
        extra="ignore",
    )

    app_name: str = "Tulisin"
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:5173"]

    database_url: str = "sqlite+aiosqlite:///./data/tulisin.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()
