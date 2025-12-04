from pathlib import Path
from typing import Union

from sqlmodel import Session, select

from app.core.config import get_settings
from app.models import Professor, Aluno, TipoUsuario
from app.schemas.user import UserResponse


def _build_profile_picture_url(usuario: Professor | Aluno) -> str | None:
    """Busca um arquivo de foto para o usuário no disco e monta a URL pública usando o global_uuid."""
    settings = get_settings()
    media_root = Path(settings.media_root).resolve()
    base_dir = media_root / settings.profile_pic_dir
    tipo_dir = base_dir / usuario.tipo_usuario.value.lower()

    def _find_match(search_dir: Path, pattern: str) -> Path | None:
        if not search_dir.exists():
            return None
        return next(search_dir.glob(pattern), None)

    matched = _find_match(tipo_dir, f"{usuario.global_uuid}.*")
    if not matched:
        return None

    prefix = settings.media_url_path if settings.media_url_path.startswith("/") else f"/{settings.media_url_path}"
    parts = [settings.profile_pic_dir]
    if matched.parent != base_dir:
        parts.append(usuario.tipo_usuario.value.lower())
    parts.append(matched.name)
    return f"{prefix.rstrip('/')}/{'/'.join(parts)}"


def montar_resposta_usuario(usuario: Union[Professor, Aluno]) -> UserResponse:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    profile_picture_url = _build_profile_picture_url(usuario) if usuario and usuario.id else None

    return UserResponse(
        id=usuario.id,
        global_uuid=usuario.global_uuid,
        nome=usuario.nome,
        cpf=usuario.cpf,
        data_nascimento=usuario.data_nascimento,
        email=usuario.email,
        tipo_usuario=tipo,
        telefone=getattr(usuario, "telefone", None),
        bio=getattr(usuario, "bio", None),
        texto_intro=getattr(usuario, "texto_intro", None),
        texto_desc=getattr(usuario, "texto_desc", None),
        profile_picture=profile_picture_url,
    )


def buscar_usuario_por_id(db: Session, user_id: int) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.id == user_id)).first()
        if usuario:
            return usuario
    return None


def buscar_usuario_por_uuid(db: Session, user_uuid: str) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.global_uuid == user_uuid)).first()
        if usuario:
            return usuario
    return None
