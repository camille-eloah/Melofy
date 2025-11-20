import os
from functools import lru_cache
from typing import List, Optional

from pydantic import BaseModel


class Settings(BaseModel):
    app_title: str = "Melofy"
    app_description: str = "O seu app de música."
    app_version: str = "0.1.0"

    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "change-me")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")

    cookie_secure: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"
    cookie_samesite: str = os.getenv("COOKIE_SAMESITE", "lax")
    cookie_domain: Optional[str] = os.getenv("COOKIE_DOMAIN")


@lru_cache
def get_settings() -> Settings:
    return Settings()
