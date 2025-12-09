"""
Schemas para configurações do professor
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class TipoAulaEnum(str, Enum):
    REMOTA = "remota"
    PRESENCIAL = "presencial"
    DOMICILIO = "domicilio"


class LocalizacaoSchema(BaseModel):
    """Schema para localização de aula presencial"""
    cidade: str = Field(..., min_length=1)
    estado: str = Field(..., min_length=2, max_length=2)
    rua: str = Field(..., min_length=1)
    numero: str = Field(..., min_length=1)
    bairro: str = Field(..., min_length=1)
    complemento: Optional[str] = Field(None)

    class Config:
        from_attributes = True


class ConfigAulaRemotaCreate(BaseModel):
    """Schema para criar/atualizar config de aula remota"""
    link_meet: str = Field(..., min_length=10)
    ativo: bool = Field(default=True)

    @validator('link_meet')
    def validate_meet_link(cls, v):
        if 'meet.google.com' not in v:
            raise ValueError('Link deve ser do Google Meet')
        return v

    class Config:
        from_attributes = True


class ConfigAulaRemotaRead(ConfigAulaRemotaCreate):
    """Schema para leitura de config de aula remota"""
    id: int
    prof_id: int
    criado_em: datetime
    atualizado_em: datetime


class ConfigAulaPresencialCreate(BaseModel):
    """Schema para criar/atualizar config de aula presencial"""
    cidade: str = Field(..., min_length=1)
    estado: str = Field(..., min_length=2, max_length=2)
    rua: str = Field(..., min_length=1)
    numero: str = Field(..., min_length=1)
    bairro: str = Field(..., min_length=1)
    complemento: Optional[str] = Field(None)
    ativo: bool = Field(default=True)

    class Config:
        from_attributes = True


class ConfigAulaPresencialRead(ConfigAulaPresencialCreate):
    """Schema para leitura de config de aula presencial"""
    id: int
    prof_id: int
    criado_em: datetime
    atualizado_em: datetime


class ConfigAulaDomicilioCreate(BaseModel):
    """Schema para criar/atualizar config de aula domicílio"""
    ativo: bool = Field(default=True)

    class Config:
        from_attributes = True


class ConfigAulaDomicilioRead(ConfigAulaDomicilioCreate):
    """Schema para leitura de config de aula domicílio"""
    id: int
    prof_id: int
    criado_em: datetime
    atualizado_em: datetime


class ConfigProfessorCreate(BaseModel):
    """Schema para criar/atualizar config geral do professor"""
    valor_hora_aula: Optional[float] = Field(None, gt=0)
    tipos_aula: list[TipoAulaEnum] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ConfigProfessorRead(ConfigProfessorCreate):
    """Schema para leitura de config geral do professor"""
    id: int
    prof_id: int
    criado_em: datetime
    atualizado_em: datetime


class ConfigProfessorCompleta(BaseModel):
    """Schema com todas as configurações do professor"""
    config_geral: Optional[ConfigProfessorRead] = None
    config_remota: Optional[ConfigAulaRemotaRead] = None
    config_presencial: Optional[ConfigAulaPresencialRead] = None
    config_domicilio: Optional[ConfigAulaDomicilioRead] = None

    class Config:
        from_attributes = True


class SalvarConfiguracaoRequest(BaseModel):
    """Schema para salvar configurações completas do professor"""
    valor_hora_aula: Optional[float] = Field(None, gt=0)
    tipos_aula_selecionados: list[TipoAulaEnum] = Field(..., description="Lista de tipos de aula selecionados")
    
    # Configurações específicas por tipo
    link_meet: Optional[str] = Field(None)
    localizacao: Optional[LocalizacaoSchema] = Field(None)
    ativo_domicilio: Optional[bool] = Field(None)

    class Config:
        from_attributes = True

