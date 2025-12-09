import uuid
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, date
from enum import Enum
from pydantic_settings import BaseSettings
from typing import List
from sqlalchemy import Column, Integer, ForeignKey, Numeric


# ----------------------------
# Usuários
# ----------------------------
class TipoUsuario(str, Enum):
    PROFESSOR = "PROFESSOR"
    ALUNO = "ALUNO"

    def label(self) -> str:
        return self.value.title()


class UserBase(SQLModel):
    nome: str = Field(nullable=False)
    email: str = Field(index=True, nullable=False, unique=True)
    cpf: str = Field(index=True, nullable=False, unique=True)
    data_nascimento: date = Field(nullable=False)

class StatusConta(str, Enum):
    ATIVO = "ATIVO"
    DESATIVADO = "DESATIVADO"
    EXCLUSAO = "EXCLUSAO"

    def label(self) -> str:
        return {
            "ATIVO": "Ativo",
            "DESATIVADO": "Desativado",
            "EXCLUSAO": "Exclusao",
        }[self.value]

class Professor(UserBase, table=True):
    __tablename__ = "tb_professor"

    id: Optional[int] = Field(default=None, primary_key=True)
    global_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), index=True, unique=True, nullable=False)
    tipo_usuario: TipoUsuario = Field(default=TipoUsuario.PROFESSOR, nullable=False)
    bio: Optional[str] = Field(default=None, nullable=True)
    texto_intro: Optional[str] = Field(default=None, nullable=True)
    texto_desc: Optional[str] = Field(default=None, nullable=True)
    telefone: Optional[str] = Field(default=None, nullable=True)
    hashed_password: str
    profile_picture: Optional[str] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    vacation_mode: bool = Field(default=False, nullable=False)
    conta_status: StatusConta = Field(default=StatusConta.ATIVO, nullable=False)

    aulas: list["Aula"] = Relationship(back_populates="professor")

    # cada professor pode ter 1 ou N contas bancárias
    dados_bancarios: list["DadosBancarios"] = Relationship(back_populates="professor")
    instrumentos_rel: List["ProfessorInstrumento"] = Relationship(back_populates="professor")
    tags_rel: List["ProfessorTag"] = Relationship(back_populates="professor")


class Aluno(UserBase, table=True):
    __tablename__ = "tb_aluno"

    id: Optional[int] = Field(default=None, primary_key=True)
    global_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), index=True, unique=True, nullable=False)
    tipo_usuario: TipoUsuario = Field(default=TipoUsuario.ALUNO, nullable=False)
    bio: Optional[str] = Field(default=None, nullable=True)
    texto_intro: Optional[str] = Field(default=None, nullable=True)
    texto_desc: Optional[str] = Field(default=None, nullable=True)
    telefone: Optional[str] = Field(default=None, nullable=True)
    hashed_password: str
    profile_picture: Optional[str] = Field(default=None, nullable=True)
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
    tipo: str  # referencia tb_categoria.id

    aulas: List["Aula"] = Relationship(back_populates="instrumento")
    professores_rel: List["ProfessorInstrumento"] = Relationship(back_populates="instrumento")
    tags_rel: List["Tag"] = Relationship(back_populates="instrumento")


class Categoria(SQLModel, table=True):
    __tablename__ = "tb_categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(nullable=False, unique=True)

# ----------------------------
# Tags
# ----------------------------

class TagTipo(str, Enum):
    INSTRUMENTO = "INSTRUMENTO"
    LIVRE = "LIVRE"


class Tag(SQLModel, table=True):
    __tablename__ = "tb_tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    nome: str = Field(nullable=False, unique=True, index=True)
    slug: Optional[str] = Field(default=None)
    tipo: TagTipo = Field(default=TagTipo.LIVRE, nullable=False)
    instrumento_id: Optional[int] = Field(default=None, foreign_key="tb_instrumento.id")

    instrumento: Optional[Instrumento] = Relationship(back_populates="tags_rel")
    professores_rel: List["ProfessorTag"] = Relationship(back_populates="tag")

# ----------------------------
# Instrumentos professores
# ----------------------------


class ProfessorInstrumento(SQLModel, table=True):
    __tablename__ = "tb_professor_instrumento"

    id: Optional[int] = Field(default=None, primary_key=True)
    id_professor: int = Field(
        sa_column=Column("id_professor", Integer, ForeignKey("tb_professor.id"), nullable=False)
    )
    instrumento_id: int = Field(
        sa_column=Column("id_instrumento", Integer, ForeignKey("tb_instrumento.id"), nullable=False)
    )

    professor: Professor = Relationship(back_populates="instrumentos_rel")
    instrumento: Instrumento = Relationship(back_populates="professores_rel")


class ProfessorInstrumentosEscolha(SQLModel):
    # schema usado só no body da requisição (não é tabela!)
    id_professor: int
    instrumentos_ids: List[int]


class ProfessorTag(SQLModel, table=True):
    __tablename__ = "tb_professor_tag"

    id: Optional[int] = Field(default=None, primary_key=True)
    id_professor: int = Field(
        sa_column=Column("id_professor", Integer, ForeignKey("tb_professor.id"), nullable=False)
    )
    tag_id: int = Field(
        sa_column=Column("tag_id", Integer, ForeignKey("tb_tags.id"), nullable=False)
    )

    professor: Professor = Relationship(back_populates="tags_rel")
    tag: Tag = Relationship(back_populates="professores_rel")


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
# Pacotes de Aulas
# ----------------------------

class Pacote(SQLModel, table=True):
    __tablename__ = "tb_pacotes"

    pac_id: Optional[int] = Field(default=None, primary_key=True)
    pac_prof_id: int = Field(foreign_key="tb_professor.id", nullable=False)
    pac_nome: str = Field(nullable=False)                    # Nome/descrição do pacote
    pac_quantidade_aulas: int = Field(nullable=False, gt=0)  # Quantidade de aulas (> 0)
    pac_valor_total: float = Field(gt=0, sa_column=Column(Numeric(10, 2), nullable=False))  # Valor total
    pac_valor_hora_aula: Optional[float] = Field(default=None, nullable=True)  # Valor calculado: total / quantidade
    pac_criado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    pac_ativo: bool = Field(default=True, nullable=False)

    # Relationship para acesso ao professor
    professor: Optional[Professor] = Relationship()

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
    id_professor: Optional[int] = Field(default=None, foreign_key="tb_professor.id")
    aluno_id: Optional[int] = Field(default=None, foreign_key="tb_aluno.id")

    professor: Optional[Professor] = Relationship(back_populates="dados_bancarios")
    aluno: Optional[Aluno] = Relationship(back_populates="dados_bancarios")

#Feedback

class Feedback(SQLModel, table=True):
    __tablename__ = "tb_feedback"
    
    id: int | None = Field(default=None, primary_key=True)
    nome: str
    email: str
    assunto: str
    mensagem: str
    criado_em: datetime = Field(default_factory=datetime.utcnow)


# ----------------------------
# Configurações do Professor
# ----------------------------

class ConfigProfessor(SQLModel, table=True):
    __tablename__ = "tb_config_professor"

    id: Optional[int] = Field(default=None, primary_key=True)
    prof_id: int = Field(foreign_key="tb_professor.id", nullable=False, unique=True)
    valor_hora_aula: Optional[float] = Field(default=None, sa_column=Column(Numeric(10, 2), nullable=True))
    tipo_aula_principal: Optional[str] = Field(default=None, nullable=True)  # 'remota', 'presencial', 'domicilio'
    criado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    atualizado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    professor: Optional[Professor] = Relationship()


class ConfigAulaRemota(SQLModel, table=True):
    __tablename__ = "tb_config_aula_remota"

    id: Optional[int] = Field(default=None, primary_key=True)
    prof_id: int = Field(foreign_key="tb_professor.id", nullable=False, unique=True)
    link_meet: str = Field(nullable=False)
    criado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    atualizado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    professor: Optional[Professor] = Relationship()


class ConfigAulaPresencial(SQLModel, table=True):
    __tablename__ = "tb_config_aula_presencial"

    id: Optional[int] = Field(default=None, primary_key=True)
    prof_id: int = Field(foreign_key="tb_professor.id", nullable=False, unique=True)
    cidade: str = Field(nullable=False)
    estado: str = Field(nullable=False)  # Ex: "SP", "RJ"
    rua: str = Field(nullable=False)
    numero: str = Field(nullable=False)
    bairro: str = Field(nullable=False)
    complemento: Optional[str] = Field(default=None, nullable=True)  # Ex: "Sala 203, Bloco B"
    criado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    atualizado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    professor: Optional[Professor] = Relationship()


class ConfigAulaDomicilio(SQLModel, table=True):
    __tablename__ = "tb_config_aula_domicilio"

    id: Optional[int] = Field(default=None, primary_key=True)
    prof_id: int = Field(foreign_key="tb_professor.id", nullable=False, unique=True)
    ativo: bool = Field(default=True, nullable=False)
    criado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    atualizado_em: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    professor: Optional[Professor] = Relationship()


# ----------------------------
# Mensagens privadas
# ----------------------------
class Message(SQLModel, table=True):
    __tablename__ = "tb_mensagens"

    id: Optional[int] = Field(default=None, primary_key=True)
    remetente_uuid: str = Field(nullable=False, index=True)
    remetente_tipo: TipoUsuario = Field(nullable=False)
    destinatario_uuid: str = Field(nullable=False, index=True)
    destinatario_tipo: TipoUsuario = Field(nullable=False)
    texto: str = Field(nullable=False)
    lido: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
