from datetime import date, timedelta
import logging
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.security import (
    _hash_password,
    _verify_password,
    _create_token,
    _set_auth_cookies,
    _clear_auth_cookies,
)
from app.db_connection import get_session
from app.models import Professor, Aluno, Instrumento, DadosBancarios, Pagamento, TipoUsuario


def _configure_logging():
    """Usa os handlers do uvicorn para exibir logs das rotas e da segurança em DEBUG."""
    settings_local = get_settings()
    log_level = logging.DEBUG if settings_local.debug else logging.INFO

    if not logging.getLogger().handlers:
        logging.basicConfig(level=log_level)

    uvicorn_logger = logging.getLogger("uvicorn.error")
    handlers = uvicorn_logger.handlers or logging.getLogger().handlers

    for name in ("app", "app.main", "app.core", "app.core.security"):
        logger = logging.getLogger(name)
        logger.handlers.clear()
        logger.handlers.extend(handlers)
        logger.propagate = False  # evita logs duplicados em hierarquia
        logger.setLevel(log_level)


_configure_logging()
settings = get_settings()
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router user - rotas de usuário
router_user = APIRouter(
    prefix="/user",
    tags=["usuario"]
)

# Router auth - rotas de autenticação
router_auth = APIRouter(
    prefix="/auth",
    tags=["autenticacao"]
)

# Router classes - rotas de aulas e pacotes
router_lessons = APIRouter(
    prefix="/lessons",
    tags=["aulas"]
)

router_instruments = APIRouter(
    prefix="/instruments",
    tags=["instruments"]
)

# Router schedule - rotas de agendamento
router_schedule = APIRouter(
    prefix="/schedule",
    tags=["agendamento"]
)

# Router filter - rotas de filtragem
router_filter = APIRouter(
    prefix="/filter",
    tags=["filtragem"]
)

router_finance = APIRouter(
    prefix="/finance",
    tags=["finance"]
)

router_ratings = APIRouter(
    prefix="/ratings",
    tags=["avaliacoes"]
)


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
                raise ValueError(
                    "tipo precisa ser Professor ou Aluno"
                ) from exc
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    cpf: str
    data_nascimento: date
    email: EmailStr
    tipo: str


def _verificar_email_cpf_disponiveis(db: Session, email: str, cpf: str) -> None:
    for model in (Professor, Aluno):
        if db.exec(select(model).where(model.email == email)).first():
            raise HTTPException(status_code=400, detail="E-mail já cadastrado")
        if db.exec(select(model).where(model.cpf == cpf)).first():
            raise HTTPException(status_code=400, detail="CPF já cadastrado")


def _montar_resposta_usuario(usuario: Professor | Aluno) -> UserResponse:
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    return UserResponse(
        id=usuario.id,
        nome=usuario.nome,
        cpf=usuario.cpf,
        data_nascimento=usuario.data_nascimento,
        email=usuario.email,
        tipo=tipo.label(),
    )


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


def _obter_usuario_por_email(db: Session, email: str) -> Professor | Aluno | None:
    for model in (Professor, Aluno):
        usuario = db.exec(select(model).where(model.email == email)).first()
        if usuario:
            return usuario
    return None

# ----------------------------
# 0. Usuário
# ----------------------------

@router_user.post("/", response_model=UserResponse, status_code=201)
def cadastrar_user(user: UserCreate, db: Session = Depends(get_session)):
    _verificar_email_cpf_disponiveis(db, user.email, user.cpf)

    if user.tipo == TipoUsuario.PROFESSOR:
        novo_usuario = Professor(
            nome=user.nome,
            email=user.email,
            cpf=user.cpf,
            data_nascimento=user.data_nascimento,
            hashed_password=_hash_password(user.senha),
        )
    else:
        novo_usuario = Aluno(
            nome=user.nome,
            email=user.email,
            cpf=user.cpf,
            data_nascimento=user.data_nascimento,
            hashed_password=_hash_password(user.senha),
        )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return _montar_resposta_usuario(novo_usuario)

# Listar todos os usuários
@router_user.get("/", response_model=list[UserResponse])
def listar_usuarios(db: Session = Depends(get_session)):
    professores = db.exec(select(Professor)).all()
    alunos = db.exec(select(Aluno)).all()
    return [_montar_resposta_usuario(usuario) for usuario in [*professores, *alunos]]

# Listar professores
@router_user.get("/professores", response_model=list[UserResponse])
def listar_professores(db: Session = Depends(get_session)):
    professores = db.exec(select(Professor)).all()
    return [_montar_resposta_usuario(professor) for professor in professores]

# ----------------------------
# 1. Autenticação
# ----------------------------

@router_auth.post("/login", response_model=UserResponse)
def login(credenciais: LoginRequest, response: Response, db: Session = Depends(get_session)):
    logger.debug("Tentativa de login", extra={"email": credenciais.email})
    usuario = _obter_usuario_por_email(db, credenciais.email)
    if not usuario or not _verify_password(credenciais.senha, usuario.hashed_password):
        logger.debug("Login falhou: credenciais inválidas", extra={"email": credenciais.email})
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    access_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )
    _set_auth_cookies(response, access_token, refresh_token)
    logger.debug("Login bem-sucedido", extra={"email": credenciais.email, "user_id": usuario.id, "tipo": tipo.value})
    return _montar_resposta_usuario(usuario)


@router_auth.post("/logout")
def logout(response: Response):
    _clear_auth_cookies(response)
    logger.debug("Logout realizado")
    return {"detail": "Logout realizado com sucesso"}

# ----------------------------
# 2. Gerenciamento de Conta
# ----------------------------

@router_user.patch("/{user_id}")
def editar_perfil(user_id: int):
    return {"msg": f"Perfil do usuário {user_id} atualizado parcialmente"}

@router_user.delete("/{user_id}")
def excluir_conta(user_id: int):
    return {"msg": f"Conta do usuário {user_id} excluída"}

# ----------------------------
# 3. Aulas 
# ----------------------------

@router_lessons.post("/aulas/")
def cadastrar_aula():
    return {"msg": "Aula cadastrada"}

@router_lessons.get("/aulas/")
def listar_aulas():
    return {"msg": "Lista de aulas"}

@router_lessons.get("/aulas/{aula_id}")
def obter_aula(aula_id: int):
    return {"msg": f"Aula {aula_id}"}

@router_lessons.put("/aulas/{aula_id}")
def editar_aula(aula_id: int):
    return {"msg": f"Aula {aula_id} atualizada totalmente"}

@router_lessons.patch("/aulas/{aula_id}")
def definir_valor(aula_id: int):
    return {"msg": f"Valor da aula {aula_id} atualizado"}

@router_lessons.delete("/aulas/{aula_id}")
def excluir_aula(aula_id: int):
    return {"msg": f"Aula {aula_id} excluída"}

# ----------------------------
# 4. Pacotes 
# ----------------------------

@router_lessons.post("/pacotes/")
def cadastrar_pacote():
    return {"msg": "Pacote cadastrado"}

@router_lessons.get("/pacotes/")
def listar_pacotes():
    return {"msg": "Lista de pacotes"}

@router_lessons.get("/pacotes/{pacote_id}")
def obter_pacote(pacote_id: int):
    return {"msg": f"Pacote {pacote_id}"}

@router_lessons.put("/pacotes/{pacote_id}")
def editar_pacote(pacote_id: int):
    return {"msg": f"Pacote {pacote_id} atualizado totalmente"}

@router_lessons.patch("/pacotes/{pacote_id}")
def definir_valor(pacote_id: int):
    return {"msg": f"Valor do pacote {pacote_id} atualizado"}

@router_lessons.delete("/pacotes/{pacote_id}")
def excluir_pacote(pacote_id: int):
    return {"msg": f"Pacote {pacote_id} excluído"}


# ----------------------------
# 5. Instrumentos musicais
# ----------------------------

@router_instruments.post("/")
def criar_instrumento():
    return {"msg": "Instrumento criado com sucesso!"}

@router_instruments.get("/{instrumento_id}")
def obter_instrumento(instrumento_id: int):
    return {"msg": f"Retornando instrumento com ID {instrumento_id}"}

@router_instruments.get("/")
def listar_instrumentos():
    return {"msg": "Lista de todos os instrumentos"}

@router_instruments.put("/{instrumento_id}")
def atualizar_instrumento(instrumento_id: int):
    return {"msg": f"Instrumento {instrumento_id} atualizado com sucesso!"}

@router_instruments.delete("/{instrumento_id}")
def deletar_instrumento(instrumento_id: int):
    return {"msg": f"Instrumento {instrumento_id} removido!"}

# ----------------------------
# 6. Filtragem
# ----------------------------

@router_filter.get("/aulas/filtrar")
def filtrar_aula():
    return {"msg": "Filtrando aulas"}

@router_filter.get("/professores/ocultar")
def ocultar_professores():
    return {"msg": "Ocultando professores"}

@router_filter.get("/professores/filtrar_por_aula")
def filtrar_professor_por_aula():
    return {"msg": "Filtrando professores por aula"}

# ----------------------------
# 7. Agendamento de Aulas
# ----------------------------
@router_schedule.get("/agendamentos/")
def listar_agendamentos(professor_id: int | None = None):
    if professor_id:
        return {"msg": f"Lista de agendamentos do professor {professor_id}"}
    return {"msg": "Lista de todos os agendamentos"}

@router_schedule.get("/agendamentos/{agendamento_id}")
def obter_agendamento(agendamento_id: int):
    return {"msg": f"Agendamento {agendamento_id}"}

@router_schedule.post("/agendamentos/")
def criar_agendamento():
    return {"msg": "Agendamento criado"}

@router_schedule.patch("/agendamentos/{agendamento_id}/cancelar")
def cancelar_agendamento(agendamento_id: int):
    return {"msg": f"Agendamento {agendamento_id} cancelado"}

# ----------------------------
# 8. Dados Bancários
# ----------------------------

@router_finance.post("/dados-bancarios")
def criar_dados_bancarios():
    return {"msg": "Dados bancários cadastrados com sucesso!"}

@router_finance.get("/dados-bancarios/{dad_id}")
def obter_dados_bancarios(dad_id: int):
    return {"msg": f"Retornando dados bancários com ID {dad_id}"}

@router_finance.put("/dados-bancarios/{dad_id}")
def atualizar_dados_bancarios(dad_id: int):
    return {"msg": f"Dados bancários com ID {dad_id} atualizados com sucesso!"}

@router_finance.delete("/dados-bancarios/{dad_id}")
def deletar_dados_bancarios(dad_id: int):
    return {"msg": f"Dados bancários com ID {dad_id} removidos!"}

# ----------------------------
# 9. Pagamentos
# ----------------------------

@router_finance.post("/pagamentos")
def criar_pagamento():
    return {"msg": "Pagamento criado com sucesso!"}

@router_finance.get("/pagamentos/{pag_id}")
def obter_pagamento(pag_id: int):
    return {"msg": f"Retornando pagamento com ID {pag_id}"}

@router_finance.get("/pagamentos/")
def listar_pagamentos():
    return {"msg": "Lista de pagamentos"}

@router_finance.patch("/pagamentos/{pag_id}/status")
def atualizar_status_pagamento(pag_id: int):
    return {"msg": f"Status do pagamento {pag_id} atualizado"}

# ----------------------------
# 10. Avaliações do Aluno
# ----------------------------

@router_ratings.post("/aluno")
def criar_avaliacao_aluno():
    return {"msg": "Avaliação do aluno criada com sucesso!"}

@router_ratings.get("/aluno/{ava_id}")
def obter_avaliacao_aluno(ava_id: int):
    return {"msg": f"Retornando avaliação do aluno com ID {ava_id}"}

@router_ratings.get("/aluno/")
def listar_avaliacoes_alunos():
    return {"msg": "Lista de avaliações dos alunos"}

@router_ratings.put("/aluno/{ava_id}")
def atualizar_avaliacao_aluno(ava_id: int):
    return {"msg": f"Avaliação do aluno {ava_id} atualizada com sucesso!"}

@router_ratings.delete("/aluno/{ava_id}")
def deletar_avaliacao_aluno(ava_id: int):
    return {"msg": f"Avaliação do aluno {ava_id} removida!"}

# ----------------------------
# 11. Avaliações do Professor
# ----------------------------

@router_ratings.post("/professor")
def criar_avaliacao_professor():
    return {"msg": "Avaliação do professor criada com sucesso!"}

@router_ratings.get("/professor/{ava_id}")
def obter_avaliacao_professor(ava_id: int):
    return {"msg": f"Retornando avaliação do professor com ID {ava_id}"}

@router_ratings.get("/professor/")
def listar_avaliacoes_professores():
    return {"msg": "Lista de avaliações dos professores"}

@router_ratings.put("/professor/{ava_id}")
def atualizar_avaliacao_professor(ava_id: int):
    return {"msg": f"Avaliação do professor {ava_id} atualizada com sucesso!"}

@router_ratings.delete("/professor/{ava_id}")
def deletar_avaliacao_professor(ava_id: int):
    return {"msg": f"Avaliação do professor {ava_id} removida!"}

app.include_router(router_user)
app.include_router(router_auth)
app.include_router(router_lessons)
app.include_router(router_instruments)
app.include_router(router_schedule)
app.include_router(router_finance)
app.include_router(router_ratings)
