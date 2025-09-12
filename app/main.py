from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from models import Professor, Aluno, Instrumentos
from typing import List

app = FastAPI(
    title="Melofy",
    description="O seu app de música.",
    version="0.1.0",
)



@app.post("/user", response_class=HTMLResponse)
def cadastrar_user():
    return

@app.get("/user", response_class=HTMLResponse)
def obter_usuario():
    return 

@app.post("/agendar-aula", response_class=HTMLResponse)
def agendar_aula():
    return 

@app.post("/cancelar-aula", response_class=HTMLResponse)
def cadastrar_aula():
    return

