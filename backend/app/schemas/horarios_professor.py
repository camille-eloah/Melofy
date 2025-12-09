from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, time, timedelta


class HorarioProfessorCreate(BaseModel):
    """Schema para criar um horário disponível"""
    dia_semana: str = Field(..., description="Dia da semana: Segunda, Terça, etc")
    horario: str = Field(..., description="Horário no formato HH:MM")

    @field_validator('horario')
    def validate_time_format(cls, v):
        """Valida formato HH:MM"""
        try:
            hour, minute = v.split(':')
            h, m = int(hour), int(minute)
            if not (0 <= h <= 23 and 0 <= m <= 59):
                raise ValueError('Formato de hora inválido. Use HH:MM')
        except (ValueError, AttributeError):
            raise ValueError('Formato de hora inválido. Use HH:MM')
        return v


class HorarioProfessorRead(BaseModel):
    """Schema para leitura de um horário disponível"""
    id: int
    prof_id: int
    dia_semana: str
    horario: str
    ativo: bool
    criado_em: datetime

    @field_validator('horario', mode='before')
    def convert_timedelta_to_str(cls, v):
        """Converte timedelta (do MySQL) para string HH:MM"""
        if isinstance(v, timedelta):
            total_seconds = int(v.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            return f"{hours:02d}:{minutes:02d}"
        return v

    class Config:
        from_attributes = True


class HorariosProfessorBulkCreate(BaseModel):
    """Schema para criar múltiplos horários de uma vez"""
    horarios: List[HorarioProfessorCreate] = Field(..., description="Lista de horários a serem criados")


class HorariosPorDiaRead(BaseModel):
    """Schema para leitura de horários agrupados por dia"""
    dia_semana: str
    horarios: List[str]  # Lista de horários no formato HH:MM


class HorariosDisponiveisResponse(BaseModel):
    """Response com todos os horários disponíveis do professor"""
    professor_id: int
    horarios_por_dia: List[HorariosPorDiaRead]
    total_horarios: int
