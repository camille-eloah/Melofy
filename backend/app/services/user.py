from typing import Union

from app.models import Professor, Aluno, TipoUsuario
from app.schemas.user import UserResponse


def montar_resposta_usuario(usuario: Union[Professor, Aluno]) -> UserResponse:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    return UserResponse(
        id=usuario.id,
        nome=usuario.nome,
        cpf=usuario.cpf,
        data_nascimento=usuario.data_nascimento,
        email=usuario.email,
        tipo=tipo.label(),
    )
