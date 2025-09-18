from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse
from app.models import Professor, Aluno, Instrumento, DadosBancarios, Pagamento
from typing import List

app = FastAPI(
    title="Melofy",
    description="O seu app de música.",
    version="0.1.0",
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

# ----------------------------
# 0. Usuário
# ----------------------------

@router_user.post("/")
def cadastrar_user():
    return {"msg": "Usuário criado"}

# Listar todos os usuários
@router_user.get("/")
def listar_usuarios():
    return {"msg": "Lista de usuários"}

# Listar professores
@router_user.get("/professores")
def listar_professores():
    return {"msg": "Lista de professores"}

# ----------------------------
# 1. Autenticação
# ----------------------------

@router_auth.post("/login")
def login():
    return

@router_auth.post('/logout')
def logout():
    return

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