import logging
import re
from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.models import TipoUsuario

logger = logging.getLogger(__name__)


class UserCreate(BaseModel):
    nome: str
    cpf: str
    data_nascimento: date
    email: EmailStr
    senha: str
    tipo: TipoUsuario
    telefone: str | None = None
    bio: str | None = None
    texto_intro: str | None = None
    texto_desc: str | None = None

    @field_validator("tipo", mode="before")
    @classmethod
    def normalizar_tipo(cls, value):
        if isinstance(value, str):
            upper_value = value.strip().upper()
            try:
                tipo_enum = TipoUsuario(upper_value)
                logger.debug("Tipo de usuário normalizado", extra={"original": value, "normalizado": tipo_enum.value})
                return tipo_enum
            except ValueError as exc:
                raise ValueError("tipo precisa ser Professor ou Aluno") from exc
        return value

    @field_validator("telefone", mode="before")
    @classmethod
    def normalizar_telefone(cls, value):
        if value is None:
            return value
        digits = re.sub(r"\D", "", str(value))
        return digits or None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    global_uuid: str
    nome: str
    cpf: str
    data_nascimento: date
    email: EmailStr
    tipo_usuario: TipoUsuario
    telefone: str | None = None
    bio: str | None = None
    texto_intro: str | None = None
    texto_desc: str | None = None
    profile_picture: str | None = None


class UserUpdate(BaseModel):
    nome: str | None = None
    email: EmailStr | None = None
    telefone: str | None = None
    bio: str | None = None
    texto_intro: str | None = None
    texto_desc: str | None = None

    @field_validator("telefone", mode="before")
    @classmethod
    def normalizar_telefone(cls, value):
        if value is None:
            return value
        digits = re.sub(r"\D", "", str(value))
        return digits or None
