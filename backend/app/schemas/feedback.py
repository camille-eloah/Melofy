from pydantic import BaseModel, EmailStr
from datetime import datetime

class FeedbackCreate(BaseModel):
    nome: str
    email: EmailStr
    assunto: str
    mensagem: str

class FeedbackRead(BaseModel):
    id: int
    nome: str
    email: EmailStr
    assunto: str
    mensagem: str
    criado_em: datetime

    class Config:
        from_attributes = True 
