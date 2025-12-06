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
    professor_id: int
    instrumentos_ids: List[int]