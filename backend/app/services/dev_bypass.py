from datetime import date
import logging

from app.core.config import get_settings
from app.core.security import _hash_password
from app.models import Professor, Aluno

logger = logging.getLogger(__name__)
settings = get_settings()

BYPASS_LOGINS = {"admin", "admin@melofy.dev"}
BYPASS_PASSWORD = "123"
_DEV_BYPASS_HASH = _hash_password(BYPASS_PASSWORD)


def bypass_ativo() -> bool:
    return settings.allow_dev_bypass


def credenciais_bypass(login: str, senha: str) -> bool:
    return bypass_ativo() and login in BYPASS_LOGINS and senha == BYPASS_PASSWORD


def obter_usuario_bypass() -> Professor:
    """Cria um usuário de desenvolvimento para bypass sem depender do banco."""
    return Professor(
        id=settings.dev_bypass_user_id,
        nome="Administrador Dev",
        email="admin@melofy.dev",
        cpf="00000000000",
        data_nascimento=date(1990, 1, 1),
        telefone=None,
        bio="Usuário bypass para desenvolvimento",
        hashed_password=_DEV_BYPASS_HASH,
    )


def eh_usuario_bypass(usuario: Professor | Aluno | None) -> bool:
    return getattr(usuario, "id", None) == settings.dev_bypass_user_id
