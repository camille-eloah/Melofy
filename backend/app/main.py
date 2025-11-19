import os
from datetime import date, datetime, timedelta
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from sqlmodel import Session, select

from app.db_connection import get_session
from app.models import Professor, Aluno, Instrumento, DadosBancarios, Pagamento, TipoUsuario

app = FastAPI(
    title="Melofy",
    description="O seu app de música.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
JWT_ALGORITHM = "HS256"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")
COOKIE_DOMAIN = os.getenv("COOKIE_DOMAIN")

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


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def _create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + expires_delta
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/", domain=COOKIE_DOMAIN)
    response.delete_cookie("refresh_token", path="/", domain=COOKIE_DOMAIN)


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
    usuario = _obter_usuario_por_email(db, credenciais.email)
    if not usuario or not _verify_password(credenciais.senha, usuario.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    access_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "access"},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = _create_token(
        {"sub": str(usuario.id), "tipo": tipo.value, "scope": "refresh"},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    _set_auth_cookies(response, access_token, refresh_token)
    return _montar_resposta_usuario(usuario)


@router_auth.post("/logout")
def logout(response: Response):
    _clear_auth_cookies(response)
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
