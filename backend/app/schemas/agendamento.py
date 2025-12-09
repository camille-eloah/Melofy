from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date


class HorarioAgendamento(BaseModel):
    """Representa um horário selecionado pelo aluno (data + hora)"""
    date: str = Field(..., description="Data no formato YYYY-MM-DD")
    time: str = Field(..., description="Hora no formato HH:MM")

    @field_validator('time')
    def validate_time_format(cls, v):
        """Valida formato HH:MM"""
        try:
            hour, minute = v.split(':')
            h, m = int(hour), int(minute)
            if not (0 <= h <= 23 and 0 <= m <= 59):
                raise ValueError
        except:
            raise ValueError('Formato de hora inválido. Use HH:MM')
        return v


class ModalidadeAgendamento(BaseModel):
    """Modalidade de aula selecionada"""
    id: str = Field(..., description="ID da modalidade: remota, presencial ou domicilio")
    label: str = Field(..., description="Nome da modalidade para exibição")
    

class InstrumentoAgendamento(BaseModel):
    """Instrumento selecionado"""
    id: int = Field(..., description="ID do instrumento")
    nome: str = Field(..., description="Nome do instrumento")


class PacoteAgendamento(BaseModel):
    """Pacote selecionado"""
    pac_id: int
    pac_nome: str
    pac_quantidade_aulas: int
    pac_valor_total: float


class SolicitacaoAgendamentoCreate(BaseModel):
    """Schema para criar uma nova solicitação de agendamento"""
    agendamentos: List[HorarioAgendamento] = Field(..., description="Lista de horários selecionados")
    pacote: PacoteAgendamento = Field(..., description="Pacote escolhido")
    modalidade: ModalidadeAgendamento = Field(..., description="Modalidade de aula")
    instrumento: InstrumentoAgendamento = Field(..., description="Instrumento escolhido")
    observacao: Optional[str] = Field(None, max_length=500, description="Observação opcional do aluno")
    professor_id: int = Field(..., description="ID do professor que receberá a solicitação")

    @field_validator('agendamentos')
    def validate_agendamentos_count(cls, v, info):
        """Valida que o número de horários corresponde ao pacote"""
        if len(v) == 0:
            raise ValueError('Pelo menos um horário deve ser selecionado')
        return v


class SolicitacaoHorarioRead(BaseModel):
    """Schema para leitura de um horário da solicitação"""
    id: int
    horario_data: date
    horario_hora: str

    class Config:
        from_attributes = True


class SolicitacaoAgendamentoRead(BaseModel):
    """Schema para leitura de uma solicitação de agendamento"""
    sol_id: int
    sol_prof_id: int
    sol_prof_global_uuid: str
    sol_alu_id: int
    sol_alu_global_uuid: str
    sol_instr_id: int
    sol_pac_id: Optional[int]
    sol_modalidade: str
    sol_status: str
    sol_mensagem: Optional[str]
    sol_criado_em: datetime
    horarios: List[SolicitacaoHorarioRead] = []

    class Config:
        from_attributes = True
