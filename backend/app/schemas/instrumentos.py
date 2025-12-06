from typing import Optional, List
from sqlmodel import SQLModel
from pydantic import BaseModel

class InstrumentoBase(SQLModel):
    nome: str
    tipo: str

class InstrumentoCreate(InstrumentoBase):
    pass

class InstrumentoRead(InstrumentoBase):
    id: int
    nome: str

class InstrumentoUpdate(SQLModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None

class ProfessorInstrumentosCreate(SQLModel):
    professor_id: int
    instrumentos_ids: List[int]

class UserReadWithInstrumentos(BaseModel):
    id: int
    nome: str
    email: str
    instrumentos: list[InstrumentoRead] = []

class ProfessorInstrumentosEscolha(SQLModel):
    professor_id: int
    instrumentos_ids: List[int]
