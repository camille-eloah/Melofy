from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from models import Professor, Aluno, Instrumentos
from typing import List

app = FastAPI(
    title="Melofy",
    description="O seu app de música.",
    version="0.1.0",
)

# ----------------------------
# 1. Autenticação
# ----------------------------

@app.post("/user", response_class=HTMLResponse)
def cadastrar_user():
    return
    

@app.post("/login", response_class=HTMLResponse)
def login():
    return


@app.route('/logout')
def logout():
    return redirect(url_for('login'))


@app.get("/obter_usuarios", response_class=HTMLResponse)
def obter_usuarios():
    return

# ----------------------------
# 2. Gerenciamento de Conta
# ----------------------------
@app.post("/editar_perfil", response_class=HTMLResponse)
def editar_perfil():
    return 

@app.delete("/excluir_conta", response_class=HTMLResponse)
def excluir_conta():
    return 
# ----------------------------
# 3. Aulas
# ----------------------------

@app.post("/", response_class=HTMLResponse)
def cadastrar_aula():
    return 

@app.get("/listar_aulas", response_class=HTMLResponse)
def listar_aulas():
    return

@app.put("/editar_aula", response_class=HTMLResponse)
def editar_aula():
    return 


# ----------------------------
# 3. Filtragem
# ----------------------------


@app.get("/filtrar", response_class=HTMLResponse)
def filtrar_aula():
    return

@app.get("/listar_professores", response_class=HTMLResponse)
def listar_professores():
    return

@app.get("/filtrar", response_class=HTMLResponse)
def listar_professores():
    return

@app.get("/filtrar", response_class=HTMLResponse)
def ocultar_professores():
    return

@app.get("/filtrar", response_class=HTMLResponse)
def filtrar_professor_por_aula():
    return


# ----------------------------
# 4. Agendamento de Aulas
# ----------------------------
@app.get("/listar_hora_aula", response_class=HTMLResponse)
def listar_hora_aula():
    return

@app.post("/agendar-aula", response_class=HTMLResponse)
def agendar_aula():
    return

@app.post("/cancelar-aula", response_class=HTMLResponse)
def cadastrar_aula():
    return

# ----------------------------
# 5 . Pagamento
# ----------------------------

@app.post("/definir_valor", response_class=HTMLResponse)
def definir_valor():
    return

@app.delete("/remover_pacote", response_class=HTMLResponse)
def remover_pacote():
    return