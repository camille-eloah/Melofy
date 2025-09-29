from typing import Optional
from sqlmodel import SQLModel, Field, Relationship 
from datetime import datetime 
from enum import Enum

# ----------------------------
# Usuários
# ----------------------------
class UserBase(SQLModel):
    username: str = Field(index=True, nullable=False, unique=True)
    email: str = Field(index=True, nullable=False, unique=True)

class StatusConta(str, Enum):
    ATIVO = "Ativo"
    DESATIVADO = "Desativado"
    EXCLUSAO = "Exclusão"

class Professor(UserBase, table=True):
    __tablename__ = "tb_professor"

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    vacation_mode: bool = Field(default=False, nullable=False)
    status_conta: StatusConta = Field(default=StatusConta.ATIVO, nullable=False)

    aulas: list["Aula"] = Relationship(back_populates="professor")

    # cada professor pode ter 1 ou N contas bancárias
    dados_bancarios: list["DadosBancarios"] = Relationship(back_populates="professor")


class Aluno(UserBase, table=True):
    __tablename__ = "tb_aluno"

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    conta_status: StatusConta = Field(default=StatusConta.ATIVO, nullable=False)

    # cada aluno pode ter 1 ou N contas bancárias
    dados_bancarios: list["DadosBancarios"] = Relationship(back_populates="aluno")

    # Relacionamento com aulas
    aulas: list["Aula"] = Relationship(back_populates="aluno")

# ----------------------------
# Instrumentos
# ----------------------------

class Instrumento(SQLModel, table=True):
    __tablename__ = "tb_instrumento"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str
    tipo: str

    aulas: list["Aula"] = Relationship(back_populates="instrumento")

# ----------------------------
# Aulas e Pacotes 
# ----------------------------

class StatusAula(str, Enum):
    disponivel = "Disponível"
    indisponivel = "Indisponível"

class Aula(SQLModel, table=True):
    __tablename__ = "tb_aula"

    aul_id: Optional[int] = Field(default=None, primary_key=True)
    aul_prof_id: int = Field(foreign_key="tb_professor.id", nullable=False)
    aul_alu_id: Optional[int] = Field(foreign_key="tb_aluno.id", default=None)  # aluno pode não estar agendado
    aul_modalidade: str
    aul_valor: float = Field(nullable=False, sa_type="DECIMAL(10,2)")
    aul_data: datetime
    aul_inst_id: int = Field(foreign_key="tb_instrumento.id", nullable=False)
    aul_status: StatusAula = Field(default=StatusAula.disponivel, nullable=False)

    # Relacionamentos
    professor: Optional[Professor] = Relationship(back_populates="aulas")
    aluno: Optional[Aluno] = Relationship(back_populates="aulas")
    instrumento: Optional[Instrumento] = Relationship(back_populates="aulas")

# ----------------------------
# Agendamento de aulas 
# ----------------------------

class StatusSolicitacao(str, Enum):
    pendente = "Pendente"
    confirmada = "Confirmada"
    recusada = "Recusada"
    cancelada = "Cancelada"

class SolicitacaoAgendamento(SQLModel, table=True):
    __tablename__ = "tb_solicitacao_agendamento"

    sol_id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relacionamentos
    sol_prof_id: int = Field(foreign_key="tb_professor.id", nullable=False)
    sol_alu_id: int = Field(foreign_key="tb_aluno.id", nullable=False)
    sol_instr_id: int = Field(foreign_key="tb_instrumento.id", nullable=False)
    
    # Dados da solicitação
    sol_horario: datetime
    sol_modalidade: str
    sol_status: StatusSolicitacao = Field(default=StatusSolicitacao.pendente, nullable=False)
    sol_mensagem: Optional[str] = Field(default=None)

    # Relationships para acesso rápido
    professor: Optional[Professor] = Relationship()
    aluno: Optional[Aluno] = Relationship()
    instrumento: Optional[Instrumento] = Relationship()

# ----------------------------
# Avaliações
# ----------------------------

class AvaliacoesDoAluno(SQLModel, table=True):
    __tablename__ = "tb_avaliacoes_aluno"

    ava_id: Optional[int] = Field(default=None, primary_key=True)
    ava_comentario: Optional[str] = Field(default=None)
    ava_nota: int = Field(nullable=False, ge=1, le=5)

    # Relacionamentos
    ava_prof_avaliador: int = Field(foreign_key="tb_professor.id", nullable=False)
    ava_alu_avaliado: int = Field(foreign_key="tb_aluno.id", nullable=False)

    data_criacao: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship para facilitar acesso
    professor: Optional[Professor] = Relationship()
    aluno: Optional[Aluno] = Relationship()

class AvaliacoesDoProfessor(SQLModel, table=True):
    __tablename__ = "tb_avaliacoes_professor"

    ava_id: Optional[int] = Field(default=None, primary_key=True)
    ava_comentario: Optional[str] = Field(default=None)
    ava_nota: int = Field(nullable=False, ge=1, le=5)

    # Relacionamentos
    ava_alu_avaliador: int = Field(foreign_key="tb_aluno.id", nullable=False)
    ava_prof_avaliado: int = Field(foreign_key="tb_professor.id", nullable=False)

    data_criacao: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationship para facilitar acesso
    aluno: Optional[Aluno] = Relationship()
    professor: Optional[Professor] = Relationship()

# ----------------------------
# Pagamento
# ----------------------------

class StatusPagamento(str, Enum):
    pendente = "pendente"
    confirmado = "confirmado"
    falhou = "falhou"
    estornado = "estornado"

class Pagamento(SQLModel, table=True):
    __tablename__ = "tb_pagamento"

    pag_id: Optional[int] = Field(default=None, primary_key=True)
    pag_aul_id: Optional[int] = Field(default=None, foreign_key="tb_aula.aul_id")
    pag_alu_id: int = Field(foreign_key="tb_aluno.id", nullable=False)
    pag_prof_id: int = Field(foreign_key="tb_professor.id", nullable=False)
    pag_valor_total: float = Field(nullable=False, sa_type="DECIMAL(10,2)")
    pag_status: StatusPagamento = Field(default=StatusPagamento.pendente, nullable=False)
    pag_criacao: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relacionamentos (opcionais)
    aula: Optional[Aula] = Relationship()
    aluno: Optional[Aluno] = Relationship()
    professor: Optional[Professor] = Relationship()

# ----------------------------
# Dados Bancários
# ----------------------------

class DadosBancarios(SQLModel, table=True):
    __tablename__ = "tb_dados_bancarios"

    dad_id: Optional[int] = Field(default=None, primary_key=True)
    dad_nome: str = Field(nullable=False)               # Nome do titular
    dad_agencia: str = Field(nullable=False)            # Agência bancária
    dad_conta: str = Field(nullable=False)              # Número da conta
    dad_chave: str = Field(nullable=False, unique=True) # Chave PIX ou identificador único

    # FKs opcionais: só um dos dois será usado
    professor_id: Optional[int] = Field(default=None, foreign_key="tb_professor.id")
    aluno_id: Optional[int] = Field(default=None, foreign_key="tb_aluno.id")

    professor: Optional[Professor] = Relationship(back_populates="dados_bancarios")
    aluno: Optional[Aluno] = Relationship(back_populates="dados_bancarios")