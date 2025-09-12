from typing import Optional
from sqlmodel import SQLModel, Field, Relationship 
from datetime import datetime 

# ----------------------------
# Usuários
# ----------------------------
class UserBase(SQLModel):
    username: str = Field(index=True, nullable=False, unique=True)
    email: str = Field(index=True, nullable=False, unique=True)

class Professor(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    vacation_mode: bool = Field(default=False, nullable=False)

    aulas: list["Aula"] = Relationship(back_populates="professor")

class Aluno(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# ----------------------------
# Instrumentos
# ----------------------------

class Instrumentos(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    tipo: str

    aulas: list["Aula"] = Relationship(back_populates="instrumento")

# ----------------------------
# Aulas
# ----------------------------

class Aula(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tipo: str
    local: str
    horario: datetime

    professor_id: int = Field(foreign_key="professor.id")
    aluno_id: int = Field(foreign_key="aluno.id")
    instrumento_id: int = Field(foreign_key="instrumento.id")

    professor: Optional[Professor] = Relationship(back_populates="aulas")
    aluno: Optional[Aluno] = Relationship(back_populates="aulas")
    instrumento: Optional[Instrumento] = Relationship(back_populates="aulas")

class 