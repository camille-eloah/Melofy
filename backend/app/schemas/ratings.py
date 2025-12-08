from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator

from app.models import TipoUsuario


class RatingCreate(BaseModel):
    avaliado_id: int = Field(..., gt=0)
    avaliado_tipo: TipoUsuario
    nota: int = Field(..., ge=1, le=5)
    texto: Optional[str] = Field(default=None, max_length=2000)

    @validator("texto")
    def _normalize_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip()
        return normalized or None


class RatingRead(BaseModel):
    id: int
    avaliado_id: int
    avaliado_tipo: TipoUsuario
    autor_id: int
    autor_tipo: TipoUsuario
    autor_nome: str
    autor_foto: Optional[str] = None
    nota: int
    texto: Optional[str] = None
    criado_em: datetime


class RatingUpdate(BaseModel):
    nota: Optional[int] = Field(default=None, ge=1, le=5)
    texto: Optional[str] = Field(default=None, max_length=2000)

    @validator("texto")
    def _normalize_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip()
        return normalized or None

