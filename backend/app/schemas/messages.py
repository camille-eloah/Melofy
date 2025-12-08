# backend/app/schemas/messages.py
from pydantic import BaseModel
from datetime import datetime

class MessageOut(BaseModel):
    id: int
    remetente_uuid: str
    destinatario_uuid: str
    texto: str
    lido: bool
    created_at: datetime

    class Config:
        orm_mode = True
