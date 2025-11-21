import os
from functools import lru_cache
from pathlib import Path

from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel


class Settings(BaseModel):
    app_title: str
    app_description: str
    app_version: str

    debug: bool

    cors_origins: List[str]

    jwt_secret_key: str
    access_token_expire_minutes: int
    refresh_token_expire_days: int
    jwt_algorithm: str

    cookie_secure: bool
    cookie_samesite: str
    cookie_domain: Optional[str]
    media_root: str
    profile_pic_dir: str
    media_url_path: str


@lru_cache
def get_settings() -> Settings:
    # garante carregamento do .env local (backend/app/.env) antes de ler variáveis
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=False)

    # lê variáveis após carregar o .env
    return Settings(
        app_title=os.getenv("APP_TITLE", "Melofy"),
        app_description=os.getenv("APP_DESCRIPTION", "O seu app de música."),
        app_version=os.getenv("APP_VERSION", "0.1.0"),
        debug=os.getenv("DEBUG", "false").lower() == "true",
        cors_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        jwt_secret_key=os.getenv("JWT_SECRET_KEY", "change-me"),
        access_token_expire_minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")),
        refresh_token_expire_days=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7")),
        jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
        cookie_secure=os.getenv("COOKIE_SECURE", "false").lower() == "true",
        cookie_samesite=os.getenv("COOKIE_SAMESITE", "lax"),
        cookie_domain=os.getenv("COOKIE_DOMAIN"),
        media_root=os.getenv("MEDIA_ROOT", str(Path(__file__).resolve().parents[2] / "storage")),
        profile_pic_dir=os.getenv("PROFILE_PIC_DIR", "profile_pictures"),
        media_url_path=os.getenv("MEDIA_URL_PATH", "/media"),
    )
