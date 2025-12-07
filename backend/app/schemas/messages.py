# backend/app/schemas/messages.py
from pydantic import BaseModel
from datetime import datetime

class MessageOut(BaseModel):
    id: int
    remetente_id: int
    destinatario_id: int
    texto: str
    lido: bool
    created_at: datetime

    class Config:
        orm_mode = True
