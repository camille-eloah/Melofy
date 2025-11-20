from datetime import datetime, timedelta
import logging

from fastapi import Response
from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def _create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    token = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    logger.debug("Token criado", extra={"scope": data.get("scope"), "sub": data.get("sub"), "exp": str(to_encode['exp'])})
    return token


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )
    logger.debug("Cookies de autenticação configurados", extra={"max_age_access": settings.access_token_expire_minutes, "max_age_refresh_days": settings.refresh_token_expire_days, "domain": settings.cookie_domain})
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/", domain=settings.cookie_domain)
    response.delete_cookie("refresh_token", path="/", domain=settings.cookie_domain)
    logger.debug("Cookies de autenticação limpos", extra={"domain": settings.cookie_domain})
