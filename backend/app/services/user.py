from typing import Union

from app.models import Professor, Aluno, TipoUsuario
from app.schemas.user import UserResponse
from sqlmodel import Session, select


def montar_resposta_usuario(usuario: Union[Professor, Aluno]) -> UserResponse:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    return UserResponse(
        id=usuario.id,
        nome=usuario.nome,
        cpf=usuario.cpf,
        data_nascimento=usuario.data_nascimento,
        email=usuario.email,
        tipo=tipo.label(),
        telefone=getattr(usuario, "telefone", None),
        bio=getattr(usuario, "bio", None),
    )


def buscar_usuario_por_id(db: Session, user_id: int) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.id == user_id)).first()
        if usuario:
            return usuario
    return None
