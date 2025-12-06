from typing import List, Optional
from sqlmodel import SQLModel, Field

from app.models import TagTipo


class TagBase(SQLModel):
    nome: str = Field(min_length=1, max_length=255)
    tipo: Optional[TagTipo] = None
    instrumento_id: Optional[int] = None


class TagRead(TagBase):
    id: int
    tipo: TagTipo
    is_instrument: bool = False


class TagCreate(SQLModel):
    nome: str = Field(min_length=1, max_length=255)


class TagsSyncRequest(SQLModel):
    tags: List[str] = Field(default_factory=list)