from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from app.models import Professor, Aluno, Instrumento
from typing import List

app = FastAPI(
    title="Melofy",
    description="O seu app de música.",
    version="0.1.0",
)

# ----------------------------
# 1. Autenticação
# ----------------------------

@app.post("/user")
def cadastrar_user():
    return
    

@app.post("/login", response_class=HTMLResponse)
def login():
    return


@app.route('/logout')
def logout():
    return


@app.get("/obter_usuarios")
def obter_usuarios():
    return

@app.get("/professor")
def listar_professores():
    return

# ----------------------------
# 2. Gerenciamento de Conta
# ----------------------------
@app.post("/editar_perfil")
def editar_perfil():
    return 

@app.delete("/excluir_conta")
def excluir_conta():
    return 

# ----------------------------
# 3. Aulas 
# ----------------------------

@app.post("/aula")
def cadastrar_aula():
    return 

@app.get("/aula")
def listar_aulas():
    return

@app.put("/aula")
def editar_aula():
    return 

@app.patch("/aula")
def definir_valor():
    return

# ----------------------------
# 4. Pacotes 
# ----------------------------

@app.post("/pacote")
def cadastrar_pacote():
    return 

@app.get("/pacote")
def listar_pacote():
    return

@app.put("/pacote")
def editar_pacote():
    return 

@app.patch("/pacote")
def definir_valor():
    return

# ----------------------------
# 5. Filtragem
# ----------------------------


@app.get("/filtrar")
def filtrar_aula():
    return

@app.get("/filtrar")
def ocultar_professores():
    return

@app.get("/filtrar")
def filtrar_professor_por_aula():
    return

# ----------------------------
# 6. Agendamento de Aulas
# ----------------------------
@app.get("/listar_hora_aula")
def listar_hora_aula():
    return

@app.post("/agendar-aula")
def agendar_aula():
    return

@app.post("/cancelar-aula")
def cadastrar_aula():
    return

# ----------------------------
# 7. Pagamento
# ----------------------------

