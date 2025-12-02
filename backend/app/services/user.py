from pathlib import Path
from typing import Union

from sqlmodel import Session, select

from app.core.config import get_settings
from app.models import Professor, Aluno, TipoUsuario
from app.schemas.user import UserResponse


def _build_profile_picture_url(user_id: int) -> str | None:
    """Busca um arquivo de foto para o usuário no disco e monta a URL pública."""
    settings = get_settings()
    media_root = Path(settings.media_root).resolve()
    pic_dir = media_root / settings.profile_pic_dir
    if not pic_dir.exists():
        return None

    matched = next(pic_dir.glob(f"{user_id}.*"), None)
    if not matched:
        return None

    prefix = settings.media_url_path if settings.media_url_path.startswith("/") else f"/{settings.media_url_path}"
    return f"{prefix.rstrip('/')}/{settings.profile_pic_dir}/{matched.name}"


def montar_resposta_usuario(usuario: Union[Professor, Aluno]) -> UserResponse:
    # Mantém sua lógica de tipo, mas SEM usar .label()
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO

    profile_picture_url = _build_profile_picture_url(usuario.id) if usuario and usuario.id else None

    return UserResponse(
        id=usuario.id,
        nome=usuario.nome,
        cpf=usuario.cpf,
        data_nascimento=usuario.data_nascimento,
        email=usuario.email,

        tipo_usuario=tipo,
        telefone=getattr(usuario, "telefone", None),
        bio=getattr(usuario, "bio", None),
        profile_picture=profile_picture_url,
    )


def buscar_usuario_por_id(db: Session, user_id: int) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.id == user_id)).first()
        if usuario:
            return usuario
    return None
