import os
from functools import lru_cache
from pathlib import Path

from typing import List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    cors_origins: List[str] = ["http://localhost:3000"]
    debug: bool = True  # você já tinha dois debug, mantive só um

    # App info
    app_name: str = "Melofy"
    app_title: str = "Meu App"
    app_description: str = "Descrição do app"
    app_version: str = "1.0.0"

    # SMTP – AGORA COM VALOR PADRÃO (OPCIONAL)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    destinatario_feedback: str | None = None

    # Media
    media_root: str = "media"
    profile_pic_dir: str = "profile_pics"

    class Config:
        env_file = "backend/.env"  # se isso estiver errado, pode virar só ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    return Settings()


@lru_cache
def get_settings() -> Settings:
    # garante carregamento do .env local (backend/app/.env) antes de ler variáveis
    env_path = Path(__file__).resolve().parents[1] / ".env"
    load_dotenv(dotenv_path=env_path, override=False)

    backend_dir = Path(__file__).resolve().parents[2]
    project_root = backend_dir.parent
    media_root_env = os.getenv("MEDIA_ROOT")
    if media_root_env:
        media_root = Path(media_root_env)
        if not media_root.is_absolute():
            media_root = (project_root / media_root_env).resolve()
    else:
        media_root = (backend_dir / "storage").resolve()

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
        media_root=str(media_root),
        profile_pic_dir=os.getenv("PROFILE_PIC_DIR", "profile_pictures"),
        media_url_path=os.getenv("MEDIA_URL_PATH", "/media"),
    )
