from datetime import timedelta
import logging
import shutil
from pathlib import Path
from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from jose import JWTError
from sqlmodel import Session, select

from app.core.config import get_settings
from app.core.security import (
    _hash_password,
    _set_auth_cookies,
    _clear_auth_cookies,
    _decode_token,
)
from app.db_connection import get_session
from app.schemas.feedback import FeedbackCreate, FeedbackRead
import smtplib
from email.mime.text import MIMEText

from app.models import (
    Professor,
    Aluno,
    Instrumento,
    ProfessorInstrumento,
    Feedback,
    TipoUsuario,
    ProfessorInstrumentosEscolha,
    Tag,
    TagTipo,
    ProfessorTag,
    AvaliacoesDoAluno,
    AvaliacoesDoProfessor,
)
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.auth import LoginRequest
from app.services.auth import (
    verificar_email_cpf_disponiveis,
    autenticar_usuario,
    gerar_tokens,
    obter_usuario_por_id_tipo,
)
from app.services.dev_bypass import credenciais_bypass, obter_usuario_bypass
from typing import List
from app.services.user import montar_resposta_usuario, buscar_usuario_por_id, buscar_usuario_por_uuid

from app.core.config import get_settings
settings = get_settings()


from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models import Professor, Instrumento, ProfessorInstrumento

import logging
from app.schemas.instrumentos import (
    InstrumentoCreate,
    InstrumentoRead,
    InstrumentoUpdate,
    ProfessorInstrumentosCreate,
    ProfessorInstrumentoCreate,
)
from app.schemas.tags import TagRead, TagCreate, TagsSyncRequest
from app.schemas.ratings import RatingCreate, RatingRead


logger = logging.getLogger(__name__)

def _configure_logging():
    """Usa os handlers do uvicorn para exibir logs das rotas e da seguranca em DEBUG."""
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


settings = get_settings()
_configure_logging()
logger = logging.getLogger(__name__)
media_root_path = Path(settings.media_root).resolve()
media_root_path.mkdir(parents=True, exist_ok=True)
profile_pic_dir = media_root_path / settings.profile_pic_dir
profile_pic_dir.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.app_title,
    description=settings.app_description,
    version=settings.app_version,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
media_mount_path = settings.media_url_path if settings.media_url_path.startswith("/") else f"/{settings.media_url_path}"
app.mount(media_mount_path, StaticFiles(directory=media_root_path), name="media")

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

router_feedback = APIRouter(
    prefix="/feedback",
    tags=["feedback"]
)

router_tags = APIRouter(
    prefix="/tags",
    tags=["tags"]
)


def _normalize_tag_name(value: str) -> str:
    return (value or "").strip()


def _tag_to_response(tag: Tag) -> TagRead:
    return TagRead(
        id=tag.id,
        nome=tag.nome,
        tipo=tag.tipo,
        instrumento_id=tag.instrumento_id,
        is_instrument=bool(tag.instrumento_id),
    )


def _get_or_create_tag_by_name(db: Session, nome: str) -> Tag:
    normalized = _normalize_tag_name(nome)
    if not normalized:
        raise HTTPException(status_code=400, detail="Nome da tag invalido")

    existing = db.exec(select(Tag).where(Tag.nome.ilike(normalized))).first()
    instrument = db.exec(select(Instrumento).where(Instrumento.nome.ilike(normalized))).first()

    if existing:
        updated = False
        if instrument and (existing.instrumento_id != instrument.id or existing.tipo != TagTipo.INSTRUMENTO):
            existing.instrumento_id = instrument.id
            existing.tipo = TagTipo.INSTRUMENTO
            updated = True
        if updated:
            db.add(existing)
            db.commit()
            db.refresh(existing)
        return existing

    novo = Tag(
        nome=normalized,
        tipo=TagTipo.INSTRUMENTO if instrument else TagTipo.LIVRE,
        instrumento_id=instrument.id if instrument else None,
    )
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


def _get_current_user(request: Request, db: Session) -> tuple[TipoUsuario, Professor | Aluno]:
    token = request.cookies.get("access_token") if request else None
    if not token:
        raise HTTPException(status_code=401, detail="Nao autenticado")
    try:
        payload = _decode_token(token)
        user_id = int(payload.get("sub"))
        tipo = payload.get("tipo")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token invalido")

    usuario = obter_usuario_por_id_tipo(db, user_id, tipo)
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario nao encontrado")

    tipo_usuario = TipoUsuario(tipo)
    return tipo_usuario, usuario


def _autor_info(usuario: Professor | Aluno, tipo: TipoUsuario) -> dict:
    # Campo de foto pode ser adicionado no futuro; mantem None por ora
    foto = getattr(usuario, "profile_picture", None) if usuario else None
    return {
        "autor_id": usuario.id if usuario else None,
        "autor_tipo": tipo,
        "autor_nome": usuario.nome if usuario else "",
        "autor_foto": foto,
    }


def _avaliacao_to_response(
    avaliado_tipo: TipoUsuario,
    avaliado_id: int,
    autor_tipo: TipoUsuario,
    autor: Professor | Aluno,
    avaliacao_obj,
) -> RatingRead:
    autor_payload = _autor_info(autor, autor_tipo)
    return RatingRead(
        id=avaliacao_obj.ava_id,
        avaliado_id=avaliado_id,
        avaliado_tipo=avaliado_tipo,
        nota=avaliacao_obj.ava_nota,
        texto=avaliacao_obj.ava_comentario,
        criado_em=avaliacao_obj.data_criacao,
        **autor_payload,
    )


def _email_em_uso_por_outro(db: Session, email: str, user_id: int) -> bool:
  """Verifica se o email informado pertence a outro usuario (professor ou aluno)."""
  for model in (Professor, Aluno):
      existente = db.exec(select(model).where(model.email == email)).first()
      if existente and existente.id != user_id:
          return True
  return False


def _instrumento_to_read(instrumento: Instrumento) -> InstrumentoRead:
    return InstrumentoRead(
        id=instrumento.id,
        nome=instrumento.nome,
        tipo=str(instrumento.tipo),
    )


# ----------------------------
# 0. Usuário
# ----------------------------

@router_user.post("/", response_model=UserResponse, status_code=201)
def cadastrar_user(user: UserCreate, db: Session = Depends(get_session)):
    try:
        verificar_email_cpf_disponiveis(db, user.email, user.cpf)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    logger.debug("Iniciando criação de usuário", extra={"email": user.email, "tipo": user.tipo.value})

    if user.tipo == TipoUsuario.PROFESSOR:
        novo_usuario = Professor(
            nome=user.nome,
            email=user.email,
            cpf=user.cpf,
            data_nascimento=user.data_nascimento,
            telefone=user.telefone,
            bio=user.bio,
            texto_intro=user.texto_intro,
            texto_desc=user.texto_desc,
            hashed_password=_hash_password(user.senha),
        )
    else:
        novo_usuario = Aluno(
            nome=user.nome,
            email=user.email,
            cpf=user.cpf,
            data_nascimento=user.data_nascimento,
            telefone=user.telefone,
            bio=user.bio,
            texto_intro=user.texto_intro,
            texto_desc=user.texto_desc,
            hashed_password=_hash_password(user.senha),
        )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    logger.debug("Usuário criado id=%s tipo=%s", novo_usuario.id, novo_usuario.tipo_usuario.value)
    return montar_resposta_usuario(novo_usuario)

# Listar todos os usuários
@router_user.get("/", response_model=list[UserResponse])
def listar_usuarios(db: Session = Depends(get_session)):
    professores = db.exec(select(Professor)).all()
    alunos = db.exec(select(Aluno)).all()
    return [montar_resposta_usuario(usuario) for usuario in [*professores, *alunos]]

# Listar professores
@router_user.get("/professores", response_model=list[UserResponse])
def listar_professores(db: Session = Depends(get_session)):
    professores = db.exec(select(Professor)).all()
    return [montar_resposta_usuario(professor) for professor in professores]

@router_user.get("/alunos", response_model=list[UserResponse])
def listar_alunos(db: Session = Depends(get_session)):
    alunos = db.exec(select(Aluno)).all()
    return [montar_resposta_usuario(aluno) for aluno in alunos]


@router_user.get("/professor/{user_id}", response_model=UserResponse)
def obter_professor(user_id: int, db: Session = Depends(get_session)):
    professor = db.get(Professor, user_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return montar_resposta_usuario(professor)

@router_user.get("/professor/uuid/{user_uuid}", response_model=UserResponse)
def obter_professor_por_uuid(user_uuid: str, db: Session = Depends(get_session)):
    professor = db.exec(select(Professor).where(Professor.global_uuid == user_uuid)).first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    return montar_resposta_usuario(professor)


@router_user.get("/aluno/{user_id}", response_model=UserResponse)
def obter_aluno(user_id: int, db: Session = Depends(get_session)):
    aluno = db.get(Aluno, user_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return montar_resposta_usuario(aluno)

@router_user.get("/aluno/uuid/{user_uuid}", response_model=UserResponse)
def obter_aluno_por_uuid(user_uuid: str, db: Session = Depends(get_session)):
    aluno = db.exec(select(Aluno).where(Aluno.global_uuid == user_uuid)).first()
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return montar_resposta_usuario(aluno)


@router_user.get("/{user_id}", response_model=UserResponse)
def obter_usuario(user_id: int, db: Session = Depends(get_session)):
    usuario = buscar_usuario_por_id(db, user_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return montar_resposta_usuario(usuario)

# ----------------------------
# 1. Autenticação
# ----------------------------

@router_auth.post("/login", response_model=UserResponse)
def login(credenciais: LoginRequest, response: Response, db: Session = Depends(get_session)):
    logger.debug("Tentativa de login", extra={"email": credenciais.email})
    # Bypass imediato, sem tocar no banco
    if credenciais_bypass(credenciais.email, credenciais.senha):
        usuario = obter_usuario_bypass()
    else:
        try:
            usuario = autenticar_usuario(db, credenciais.email, credenciais.senha)
        except ValueError:
            logger.debug("Login falhou: credenciais inválidas", extra={"email": credenciais.email})
            raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token, refresh_token = gerar_tokens(usuario)
    _set_auth_cookies(response, access_token, refresh_token)
    tipo = TipoUsuario.PROFESSOR if isinstance(usuario, Professor) else TipoUsuario.ALUNO
    logger.debug("Login bem-sucedido", extra={"email": credenciais.email, "user_id": usuario.id, "tipo": tipo.value})
    return montar_resposta_usuario(usuario)


@router_auth.get("/me", response_model=UserResponse)
def obter_usuario_atual(request: Request, db: Session = Depends(get_session)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")

    try:
        payload = _decode_token(token)
        if payload.get("dev_bypass"):
            if not settings.allow_dev_bypass:
                raise HTTPException(status_code=401, detail="Token inválido ou expirado")
            return montar_resposta_usuario(obter_usuario_bypass())
        user_id = int(payload.get("sub"))
        tipo = payload.get("tipo")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")

    usuario = obter_usuario_por_id_tipo(db, user_id, tipo)
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")

    return montar_resposta_usuario(usuario)


@router_auth.post("/logout")
def logout(response: Response):
    _clear_auth_cookies(response)
    logger.debug("Logout realizado")
    return ({"msg": "Logout bem-sucedido"})


# ----------------------------
# 2. Gerenciamento de Conta
# ----------------------------

@router_user.patch("/{user_id}", response_model=UserResponse)
def editar_perfil(user_id: int, dados: UserUpdate, request: Request, db: Session = Depends(get_session)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = _decode_token(token)
        sub = int(payload.get("sub"))
        tipo_token = payload.get("tipo")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido")
    if sub != user_id:
        raise HTTPException(status_code=403, detail="Operação não permitida")
    usuario = obter_usuario_por_id_tipo(db, user_id, tipo_token)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if dados.email is not None:
        if _email_em_uso_por_outro(db, dados.email, user_id):
            raise HTTPException(status_code=400, detail="E-mail jÇ  cadastrado")
        usuario.email = dados.email

    if dados.nome is not None:
        usuario.nome = dados.nome

    if dados.telefone is not None:
        usuario.telefone = dados.telefone
    if dados.bio is not None:
        usuario.bio = dados.bio
    if hasattr(dados, "texto_intro") and dados.texto_intro is not None:
        usuario.texto_intro = dados.texto_intro
    if hasattr(dados, "texto_desc") and dados.texto_desc is not None:
        usuario.texto_desc = dados.texto_desc

    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    logger.debug("Perfil atualizado id=%s", usuario.id)
    return montar_resposta_usuario(usuario)

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

@router_instruments.post("/", response_model=InstrumentoRead, status_code=201)
def criar_instrumento(
    instrumento: InstrumentoCreate,
    db: Session = Depends(get_session),
):
    novo = Instrumento.from_orm(instrumento)
    db.add(novo)
    db.commit()
    db.refresh(novo)
    return novo


@router_instruments.get("/{instrumento_id}", response_model=InstrumentoRead)
def obter_instrumento(
    instrumento_id: int,
    db: Session = Depends(get_session),
):
    instrumento = db.get(Instrumento, instrumento_id)
    if not instrumento:
        raise HTTPException(status_code=404, detail="Instrumento não encontrado")
    return _instrumento_to_read(instrumento)

@router_instruments.post("/professor", response_model=InstrumentoRead, status_code=201)
def adicionar_instrumento_professor(
    dados: ProfessorInstrumentoCreate,
    db: Session = Depends(get_session),
):
    professor = db.get(Professor, dados.professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")

    instrumento = db.get(Instrumento, dados.instrumento_id)
    if not instrumento:
        raise HTTPException(status_code=404, detail="Instrumento não encontrado")

    existente = db.exec(
        select(ProfessorInstrumento).where(
            ProfessorInstrumento.professor_id == dados.professor_id,
            ProfessorInstrumento.instrumento_id == dados.instrumento_id,
        )
    ).first()

    if not existente:
        rel = ProfessorInstrumento(
            professor_id=dados.professor_id,
            instrumento_id=dados.instrumento_id,
        )
        db.add(rel)
        db.commit()
        db.refresh(rel)

    return _instrumento_to_read(instrumento)

@router_instruments.get("/", response_model=List[InstrumentoRead])
def listar_instrumentos(q: str | None = None, db: Session = Depends(get_session)):
    stmt = select(Instrumento)
    if q:
        stmt = stmt.where(Instrumento.nome.ilike(f"%{q}%"))
    instrumentos = db.exec(stmt).all()
    return [_instrumento_to_read(instr) for instr in instrumentos]

@router_instruments.get("/professor/{professor_id}", response_model=List[InstrumentoRead])
def listar_instrumentos_professor(professor_id: int, db: Session = Depends(get_session)):
    stmt = select(Instrumento).join(ProfessorInstrumento).where(
        ProfessorInstrumento.professor_id == professor_id
    )
    instrumentos = db.exec(stmt).all()
    return [_instrumento_to_read(instr) for instr in instrumentos]


@router_instruments.get("/professor/uuid/{user_uuid}", response_model=List[InstrumentoRead])
def listar_instrumentos_professor_por_uuid(user_uuid: str, db: Session = Depends(get_session)):
    professor = db.exec(select(Professor).where(Professor.global_uuid == user_uuid)).first()
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")
    stmt = select(Instrumento).join(ProfessorInstrumento).where(
        ProfessorInstrumento.professor_id == professor.id
    )
    instrumentos = db.exec(stmt).all()
    return [_instrumento_to_read(instr) for instr in instrumentos]


@router_instruments.put("/{instrumento_id}", response_model=InstrumentoRead)
def atualizar_instrumento(
    instrumento_id: int,
    dados: InstrumentoUpdate,
    db: Session = Depends(get_session),
):
    instrumento = db.get(Instrumento, instrumento_id)
    if not instrumento:
        raise HTTPException(status_code=404, detail="Instrumento não encontrado")

    dados_dict = dados.dict(exclude_unset=True)
    for key, value in dados_dict.items():
        setattr(instrumento, key, value)

    db.add(instrumento)
    db.commit()
    db.refresh(instrumento)
    return instrumento


@router_instruments.delete("/{instrumento_id}", status_code=204)
def deletar_instrumento(
    instrumento_id: int,
    db: Session = Depends(get_session),
):
    instrumento = db.get(Instrumento, instrumento_id)
    if not instrumento:
        raise HTTPException(status_code=404, detail="Instrumento não encontrado")

    db.delete(instrumento)
    db.commit()
    return

@router_instruments.post("/escolher")
def escolher_instrumentos_professor(
    dados: ProfessorInstrumentosCreate,
    db: Session = Depends(get_session),
):
    professor = db.get(Professor, dados.professor_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor não encontrado")

    # Apaga escolhas antigas
    antigos = db.exec(
        select(ProfessorInstrumento).where(ProfessorInstrumento.professor_id == dados.professor_id)
    ).all()
    for rel in antigos:
        db.delete(rel)

    # Salva novas escolhas
    for instr_id in dados.instrumentos_ids:
        instrumento = db.get(Instrumento, instr_id)
        if not instrumento:
            raise HTTPException(status_code=400, detail=f"Instrumento com id {instr_id} não existe")

        rel = ProfessorInstrumento(professor_id=dados.professor_id, instrumento_id=instr_id)
        db.add(rel)

    db.commit()

    # Retorna os instrumentos do professor
    stmt = select(Instrumento).join(ProfessorInstrumento).where(ProfessorInstrumento.professor_id == dados.professor_id)
    instrumentos_professor = db.exec(stmt).all()

    return {"message": "Instrumentos escolhidos com sucesso", "instrumentos": [_instrumento_to_read(instr) for instr in instrumentos_professor]}

# ----------------------------
# 5.1 Tags
# ----------------------------

@router_tags.get("/", response_model=List[TagRead])
def listar_tags(q: str | None = None, db: Session = Depends(get_session)):
    stmt = select(Tag)
    if q:
        stmt = stmt.where(Tag.nome.ilike(f"%{q}%"))
    tags = db.exec(stmt).all()
    return [_tag_to_response(tag) for tag in tags]


@router_tags.post("/", response_model=TagRead, status_code=201)
def criar_tag(tag_in: TagCreate, db: Session = Depends(get_session)):
    tag = _get_or_create_tag_by_name(db, tag_in.nome)
    return _tag_to_response(tag)


@router_user.get("/{user_id}/tags", response_model=List[TagRead])
def listar_tags_professor(user_id: int, db: Session = Depends(get_session)):
    professor = db.get(Professor, user_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor nao encontrado")
    stmt = select(Tag).join(ProfessorTag).where(ProfessorTag.professor_id == user_id)
    tags = db.exec(stmt).all()
    return [_tag_to_response(tag) for tag in tags]


@router_user.patch("/{user_id}/tags", response_model=List[TagRead])
def atualizar_tags_professor(
    user_id: int,
    dados: TagsSyncRequest,
    request: Request,
    db: Session = Depends(get_session),
):
    token = request.cookies.get("access_token") if request else None
    if not token:
        raise HTTPException(status_code=401, detail="Nao autenticado")
    try:
        payload = _decode_token(token)
        sub = int(payload.get("sub"))
        tipo_token = payload.get("tipo")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token invalido")
    if sub != user_id or tipo_token != TipoUsuario.PROFESSOR.value:
        raise HTTPException(status_code=403, detail="Operacao nao permitida")

    professor = db.get(Professor, user_id)
    if not professor:
        raise HTTPException(status_code=404, detail="Professor nao encontrado")

    nomes_unicos: List[str] = []
    vistos: set[str] = set()
    for nome in dados.tags:
        normalizado = _normalize_tag_name(nome)
        if not normalizado:
            continue
        chave = normalizado.lower()
        if chave in vistos:
            continue
        vistos.add(chave)
        nomes_unicos.append(normalizado)

    antigos = db.exec(select(ProfessorTag).where(ProfessorTag.professor_id == user_id)).all()
    for rel in antigos:
        db.delete(rel)
    db.commit()

    tags_resultado: List[Tag] = []
    for nome in nomes_unicos:
        tag = _get_or_create_tag_by_name(db, nome)
        rel = ProfessorTag(professor_id=user_id, tag_id=tag.id)
        db.add(rel)
        tags_resultado.append(tag)

    # Sincroniza tabela de instrumentos do professor com as tags de instrumento
    instrument_ids = {tag.instrumento_id for tag in tags_resultado if tag.instrumento_id}
    if instrument_ids:
        existentes = db.exec(
            select(ProfessorInstrumento).where(ProfessorInstrumento.professor_id == user_id)
        ).all()
        existentes_ids = {rel.instrumento_id for rel in existentes}

        # Remover instrumentos que saíram
        for rel in existentes:
            if rel.instrumento_id not in instrument_ids:
                db.delete(rel)

        # Adicionar instrumentos novos
        for instr_id in instrument_ids:
            if instr_id not in existentes_ids:
                db.add(ProfessorInstrumento(professor_id=user_id, instrumento_id=instr_id))

    else:
        # Nenhuma tag de instrumento: limpa relacionamentos existentes
        antigos_instr = db.exec(
            select(ProfessorInstrumento).where(ProfessorInstrumento.professor_id == user_id)
        ).all()
        for rel in antigos_instr:
            db.delete(rel)

    db.commit()
    return [_tag_to_response(tag) for tag in tags_resultado]

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
# 10/11. Avaliacoes (unificado)
# ----------------------------


@router_ratings.post("/", response_model=RatingRead, status_code=201)
def criar_avaliacao(
    rating: RatingCreate,
    request: Request,
    db: Session = Depends(get_session),
):
    autor_tipo, autor = _get_current_user(request, db)

    if rating.avaliado_tipo == TipoUsuario.PROFESSOR:
        if autor_tipo != TipoUsuario.ALUNO:
            raise HTTPException(status_code=403, detail="Apenas alunos podem avaliar professores")
        professor = db.get(Professor, rating.avaliado_id)
        if not professor:
            raise HTTPException(status_code=404, detail="Professor nao encontrado")
        nova = AvaliacoesDoProfessor(
            ava_comentario=rating.texto,
            ava_nota=rating.nota,
            ava_alu_avaliador=autor.id,
            ava_prof_avaliado=rating.avaliado_id,
        )
        db.add(nova)
        db.commit()
        db.refresh(nova)
        return _avaliacao_to_response(
            avaliado_tipo=TipoUsuario.PROFESSOR,
            avaliado_id=rating.avaliado_id,
            autor_tipo=autor_tipo,
            autor=autor,
            avaliacao_obj=nova,
        )

    if rating.avaliado_tipo == TipoUsuario.ALUNO:
        if autor_tipo != TipoUsuario.PROFESSOR:
            raise HTTPException(status_code=403, detail="Apenas professores podem avaliar alunos")
        aluno = db.get(Aluno, rating.avaliado_id)
        if not aluno:
            raise HTTPException(status_code=404, detail="Aluno nao encontrado")
        nova = AvaliacoesDoAluno(
            ava_comentario=rating.texto,
            ava_nota=rating.nota,
            ava_prof_avaliador=autor.id,
            ava_alu_avaliado=rating.avaliado_id,
        )
        db.add(nova)
        db.commit()
        db.refresh(nova)
        return _avaliacao_to_response(
            avaliado_tipo=TipoUsuario.ALUNO,
            avaliado_id=rating.avaliado_id,
            autor_tipo=autor_tipo,
            autor=autor,
            avaliacao_obj=nova,
        )

    raise HTTPException(status_code=400, detail="Tipo de avaliado invalido")


@router_ratings.get("/{tipo}/{avaliado_id}", response_model=List[RatingRead])
def listar_avaliacoes(
    tipo: TipoUsuario,
    avaliado_id: int,
    db: Session = Depends(get_session),
):
    if tipo == TipoUsuario.PROFESSOR:
        professor = db.get(Professor, avaliado_id)
        if not professor:
            raise HTTPException(status_code=404, detail="Professor nao encontrado")
        stmt = (
            select(AvaliacoesDoProfessor, Aluno)
            .join(Aluno, Aluno.id == AvaliacoesDoProfessor.ava_alu_avaliador)
            .where(AvaliacoesDoProfessor.ava_prof_avaliado == avaliado_id)
            .order_by(AvaliacoesDoProfessor.data_criacao.desc())
        )
        resultados = db.exec(stmt).all()
        return [
            _avaliacao_to_response(
                avaliado_tipo=TipoUsuario.PROFESSOR,
                avaliado_id=avaliado_id,
                autor_tipo=TipoUsuario.ALUNO,
                autor=autor,
                avaliacao_obj=avaliacao,
            )
            for avaliacao, autor in resultados
        ]

    if tipo == TipoUsuario.ALUNO:
        aluno = db.get(Aluno, avaliado_id)
        if not aluno:
            raise HTTPException(status_code=404, detail="Aluno nao encontrado")
        stmt = (
            select(AvaliacoesDoAluno, Professor)
            .join(Professor, Professor.id == AvaliacoesDoAluno.ava_prof_avaliador)
            .where(AvaliacoesDoAluno.ava_alu_avaliado == avaliado_id)
            .order_by(AvaliacoesDoAluno.data_criacao.desc())
        )
        resultados = db.exec(stmt).all()
        return [
            _avaliacao_to_response(
                avaliado_tipo=TipoUsuario.ALUNO,
                avaliado_id=avaliado_id,
                autor_tipo=TipoUsuario.PROFESSOR,
                autor=autor,
                avaliacao_obj=avaliacao,
            )
            for avaliacao, autor in resultados
        ]

    raise HTTPException(status_code=400, detail="Tipo invalido")


@router_user.post("/{user_id}/profile-picture")
async def upload_profile_picture(
    user_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
):
    token = request.cookies.get("access_token") if request else None
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = _decode_token(token)
        sub = int(payload.get("sub"))
        tipo_token = payload.get("tipo")
    except (JWTError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Token inválido")
    if sub != user_id:
        raise HTTPException(status_code=403, detail="Operação não permitida")
    usuario = obter_usuario_por_id_tipo(db, user_id, tipo_token)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    allowed_content_types = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed_content_types:
        raise HTTPException(status_code=400, detail="Apenas imagens JPEG/PNG/WebP sao permitidas")

    ext = Path(file.filename or "").suffix.lower() or ".jpg"
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        ext = ".jpg"

    tipo_dir = profile_pic_dir / usuario.tipo_usuario.value.lower()
    tipo_dir.mkdir(parents=True, exist_ok=True)

    for old_file in tipo_dir.glob(f"{usuario.global_uuid}.*"):
        try:
            old_file.unlink()
        except OSError:
            logger.warning("Nao foi possivel remover a foto anterior", exc_info=True)

    dest_path = tipo_dir / f"{usuario.global_uuid}{ext}"
    with dest_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    mount_prefix = media_mount_path.rstrip("/")
    return {
        "profile_picture": f"{mount_prefix}/{settings.profile_pic_dir}/{usuario.tipo_usuario.value.lower()}/{dest_path.name}"
    }


# 12. Feedback dos usuários


DESTINATARIO_FEEDBACK = "lucenamaria767@gmail.com"

SMTP_SERVER = settings.smtp_host
SMTP_PORT = settings.smtp_port
SMTP_USER = settings.smtp_user
SMTP_PASSWORD = settings.smtp_password   # Acessando os dados do SMTP do settings

@router_feedback.post("/", response_model=FeedbackRead, status_code=201)
def enviar_feedback(
    feedback: FeedbackCreate,
    db: Session = Depends(get_session),
):
    novo_feedback = Feedback(
        nome=feedback.nome,
        email=feedback.email,
        assunto=feedback.assunto,
        mensagem=feedback.mensagem,
    )
    db.add(novo_feedback)
    db.commit()
    db.refresh(novo_feedback)
    return novo_feedback

@router_feedback.get("/", response_model=list[FeedbackRead])
def listar_feedbacks(db: Session = Depends(get_session)):
    feedbacks = db.exec(select(Feedback)).all()
    return feedbacks

@router_feedback.get("/{fb_id}", response_model=FeedbackRead)
def obter_feedback(fb_id: int, db: Session = Depends(get_session)):
    feedback = db.get(Feedback, fb_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback não encontrado")
    return feedback



app.include_router(router_user)
app.include_router(router_auth)
app.include_router(router_lessons)
app.include_router(router_instruments)  # prefixo /instruments
app.include_router(router_schedule)
app.include_router(router_finance)
app.include_router(router_ratings)
app.include_router(router_feedback)
app.include_router(router_tags)


