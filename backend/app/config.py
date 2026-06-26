from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./database/gift_store.db"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "Phylgood Chocolates <noreply@phylgoodchocolates.com>"
    smtp_use_tls: bool = True

    app_name: str = "Phylgood Chocolates"
    app_url: str = "http://localhost:3000"
    api_url: str = "http://localhost:8000"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    media_root: str = "./media"
    max_upload_size_mb: int = 10

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
