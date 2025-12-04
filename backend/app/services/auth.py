from datetime import timedelta
import logging

from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.security import _verify_password, _create_token
from app.models import Professor, Aluno, TipoUsuario
from app.services.dev_bypass import (
    credenciais_bypass,
    eh_usuario_bypass,
    obter_usuario_bypass,
)
import jwt
from fastapi import HTTPException

logger = logging.getLogger(__name__)
settings = get_settings()

SECRET_KEY = "sua_chave_secreta"  # use a mesma chave que você usa para gerar tokens
ALGORITHM = "HS256"


def verificar_email_cpf_disponiveis(db: Session, email: str, cpf: str) -> None:
    for model in (Professor, Aluno):
        if db.exec(select(model).where(model.email == email)).first():
            logger.debug("Email em uso: %s", email)
            raise ValueError("E-mail já cadastrado")
        if db.exec(select(model).where(model.cpf == cpf)).first():
            logger.debug("CPF em uso: %s", cpf)
            raise ValueError("CPF já cadastrado")


def obter_usuario_por_email(db: Session, email: str) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.email == email)).first()
        if usuario:
            logger.debug("Usuário encontrado por email=%s id=%s", email, usuario.id)
            return usuario
    logger.debug("Usuário não encontrado por email=%s", email)
    return None


def autenticar_usuario(db: Session, login: str, senha: str):
    if credenciais_bypass(login, senha):
        logger.info("Bypass de desenvolvimento usado para login.")
        return obter_usuario_bypass()

    usuario = db.query(Professor).filter(
        (Professor.email == login) | (Professor.cpf == login)
    ).first()
    if not usuario:
        usuario = db.query(Aluno).filter(
            (Aluno.email == login) | (Aluno.cpf == login)
        ).first()
    if not usuario or not _verify_password(senha, usuario.hashed_password):
        raise ValueError("Credenciais inválidas")
    return usuario


def gerar_tokens(usuario: Professor | Aluno) -> tuple[str, str]:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    is_bypass = eh_usuario_bypass(usuario)
    access_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "access", "dev_bypass": is_bypass},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "refresh", "dev_bypass": is_bypass},
        timedelta(days=settings.refresh_token_expire_days),
    )
    logger.debug(
        "Tokens gerados para usuário id=%s tipo=%s access_exp_min=%s refresh_exp_days=%s",
        usuario.id,
        tipo.value,
        settings.access_token_expire_minutes,
        settings.refresh_token_expire_days,
    )
    return access_token, refresh_token


def obter_usuario_por_id_tipo(db: Session, user_id: int, tipo: str) -> Professor | Aluno | None:
    try:
        tipo_enum = TipoUsuario(tipo)
    except ValueError:
        logger.debug("Tipo inválido no token para user_id=%s: %s", user_id, tipo)
        return None

    model = Professor if tipo_enum == TipoUsuario.PROFESSOR else Aluno
    usuario = db.exec(select(model).where(model.id == user_id)).first()
    if usuario:
        logger.debug("Usuário recuperado por id=%s tipo=%s", user_id, tipo_enum.value)
    else:
        logger.debug("Usuário não encontrado por id=%s tipo=%s", user_id, tipo_enum.value)
    return usuario

def decode_jwt(token: str) -> int:
    """
    Decodifica o token JWT e retorna o user_id
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")  # 'sub' é o user_id que você colocou no token
        if user_id is None:
            raise ValueError("Token inválido")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")