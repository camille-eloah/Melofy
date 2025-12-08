from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PacoteCreate(BaseModel):
    """Schema para criar um novo pacote de aulas"""
    pac_nome: str = Field(..., min_length=1, max_length=255, description="Nome ou descrição do pacote")
    pac_quantidade_aulas: int = Field(..., gt=0, description="Quantidade de aulas (maior que 0)")
    pac_valor_total: float = Field(..., gt=0, description="Valor total do pacote")


class PacoteUpdate(BaseModel):
    """Schema para atualizar um pacote"""
    pac_nome: Optional[str] = Field(None, min_length=1, max_length=255)
    pac_quantidade_aulas: Optional[int] = Field(None, gt=0)
    pac_valor_total: Optional[float] = Field(None, gt=0)
    pac_ativo: Optional[bool] = None


class PacoteRead(BaseModel):
    """Schema para retornar um pacote"""
    pac_id: int
    pac_prof_id: int
    pac_nome: str
    pac_quantidade_aulas: int
    pac_valor_total: float
    pac_valor_hora_aula: Optional[float] = None
    pac_criado_em: datetime
    pac_ativo: bool

    class Config:
        from_attributes = True
