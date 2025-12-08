from typing import Optional, List
from sqlmodel import SQLModel

class InstrumentoBase(SQLModel):
    nome: str
    tipo: str

class InstrumentoCreate(InstrumentoBase):
    pass

class InstrumentoRead(InstrumentoBase):
    id: int

class InstrumentoUpdate(SQLModel):
    nome: Optional[str] = None
    tipo: Optional[str] = None

class ProfessorInstrumentosCreate(SQLModel):
    id_professor: int
    instrumentos_ids: List[int]

class ProfessorInstrumentoCreate(SQLModel):
    id_professor: int
    instrumento_id: int
