from datetime import timedelta
import logging

from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.security import _verify_password, _create_token
from app.models import Professor, Aluno, TipoUsuario

logger = logging.getLogger(__name__)
settings = get_settings()


def verificar_email_cpf_disponiveis(db: Session, email: str, cpf: str) -> None:
    for model in (Professor, Aluno):
        if db.exec(select(model).where(model.email == email)).first():
            raise ValueError("E-mail já cadastrado")
        if db.exec(select(model).where(model.cpf == cpf)).first():
            raise ValueError("CPF já cadastrado")


def obter_usuario_por_email(db: Session, email: str) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.email == email)).first()
        if usuario:
            return usuario
    return None


def autenticar_usuario(db: Session, email: str, senha: str) -> Professor | Aluno:
    usuario = obter_usuario_por_email(db, email)
    if not usuario or not _verify_password(senha, usuario.hashed_password):
        logger.debug("Autenticação falhou", extra={"email": email})
        raise ValueError("Credenciais inválidas")
    logger.debug("Autenticação bem-sucedida", extra={"email": email, "user_id": usuario.id})
    return usuario


def gerar_tokens(usuario: Professor | Aluno) -> tuple[str, str]:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    access_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )
    return access_token, refresh_token
