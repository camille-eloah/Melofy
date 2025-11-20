from datetime import date
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator

from app.models import TipoUsuario


class UserCreate(BaseModel):
    nome: str
    cpf: str
    data_nascimento: date
    email: EmailStr
    senha: str
    tipo: TipoUsuario

    @field_validator("tipo", mode="before")
    @classmethod
    def normalizar_tipo(cls, value):
        if isinstance(value, str):
            upper_value = value.strip().upper()
            try:
                return TipoUsuario(upper_value)
            except ValueError as exc:
                raise ValueError("tipo precisa ser Professor ou Aluno") from exc
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    cpf: str
    data_nascimento: date
    email: EmailStr
    tipo: str
