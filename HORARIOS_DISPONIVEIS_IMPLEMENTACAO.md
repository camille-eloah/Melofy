# Sistema de Horários Disponíveis - Documentação de Implementação

## Visão Geral
Implementação completa do sistema de horários disponíveis para professores, substituindo horários fictícios por dados dinâmicos gerenciados por cada professor através do DashProfessor.

## Arquitetura

### Backend

#### 1. Banco de Dados
**Arquivo:** `backend/database/create_database.sql` (linha ~423) e `backend/database/migration_add_horarios_professor.sql`

**Tabela:** `tb_horarios_professor`
```sql
CREATE TABLE tb_horarios_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL,
    dia_semana ENUM('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
    horario TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE,
    INDEX idx_horarios_prof_dia (prof_id, dia_semana),
    INDEX idx_horarios_ativo (prof_id, ativo)
);
```

**Características:**
- Horários vinculados ao professor (CASCADE delete)
- ENUM para dias da semana em português
- Índices otimizados para consultas por professor e dia
- Flag `ativo` para desabilitar sem deletar

#### 2. Models (SQLModel)
**Arquivo:** `backend/app/models.py` (linhas ~244-271)

**DiaSemana Enum:**
```python
class DiaSemana(str, Enum):
    Segunda = "Segunda"
    Terca = "Terça"
    Quarta = "Quarta"
    Quinta = "Quinta"
    Sexta = "Sexta"
    Sabado = "Sábado"
    Domingo = "Domingo"
```

**HorarioProfessor Model:**
```python
class HorarioProfessor(SQLModel, table=True):
    __tablename__ = "tb_horarios_professor"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    prof_id: int = Field(foreign_key="tb_professor.id", index=True)
    dia_semana: DiaSemana = Field(sa_column=Column(Enum(DiaSemana)))
    horario: str = Field(max_length=5)  # Formato "HH:MM"
    ativo: bool = Field(default=True)
    criado_em: datetime = Field(default_factory=datetime.now)
```

#### 3. Schemas (Pydantic)
**Arquivo:** `backend/app/schemas/horarios_professor.py` (novo)

**HorarioProfessorCreate:**
- Validação de formato "HH:MM"
- Validação de hora (00:00 - 23:59)
- Campos: `dia_semana`, `horario`

**HorarioProfessorRead:**
- Todos os campos do modelo
- Usado para retornar dados completos

**HorariosProfessorBulkCreate:**
- Aceita lista de horários
- Usado no POST para criar múltiplos de uma vez

**HorariosDisponiveisResponse:**
- Agrupa horários por dia da semana
- Estrutura: `{professor_id, horarios_por_dia: [{dia_semana, horarios: []}], total_horarios}`

#### 4. Endpoints da API
**Arquivo:** `backend/app/main.py` (linhas ~1844+)

**POST /professor/horarios**
- Autenticação: Requerida (professor autenticado)
- Body: `HorariosProfessorBulkCreate`
- Lógica: 
  1. Deleta todos os horários existentes do professor
  2. Cria novos horários em bulk
  3. Retorna horários agrupados por dia
- Response: `HorariosDisponiveisResponse`

**GET /professor/horarios**
- Autenticação: Requerida (professor autenticado)
- Retorna horários do professor logado
- Response: `HorariosDisponiveisResponse`

**GET /professor/{id}/horarios**
- Autenticação: Não requerida (público)
- Retorna horários de qualquer professor (para alunos visualizarem)
- Response: `HorariosDisponiveisResponse`

### Frontend

#### 1. Service Layer
**Arquivo:** `frontend/src/componentes/dashprofessor/services/horariosService.js` (novo)

**Funções:**
- `carregarHorarios()`: Busca horários do professor autenticado
- `salvarHorarios(horariosDisponiveis)`: Envia horários para API (POST)
- `carregarHorariosProfessor(professorId)`: Busca horários de qualquer professor (público)

**Mapeamento de Dias:**
```javascript
const diaParaBackend = {
  'segunda': 'Segunda',
  'terca': 'Terça',
  // ... etc
}
```

Converte entre IDs do frontend (lowercase) e nomes do backend (capitalizados).

#### 2. Hook useDashProfessor
**Arquivo:** `frontend/src/componentes/dashprofessor/hooks/useDashProfessor.js`

**Alterações:**
- Importa `horariosService`
- `carregarConfiguracoes()`: Chama `horariosService.carregarHorarios()` ao carregar dados
- `handleSave()`: Chama `horariosService.salvarHorarios()` ao salvar
- Horários salvos separadamente das configurações de aula

**Estado dos Horários:**
```javascript
horariosDisponiveis = {
  segunda: { selecionado: true/false, horarios: ["09:00", "10:00", ...] },
  terca: { ... },
  // ... para todos os 7 dias
}
```

#### 3. UI - DashProfessor
**Arquivo:** `frontend/src/componentes/dashprofessor/DashProfessor.jsx`

**Componentes existentes (já implementados):**
- Grid de seleção de dias da semana (checkboxes)
- Grid de seleção de horários por dia (08:00 - 22:00)
- Toggles: `toggleDiaSemana()`, `toggleHorario()`
- UI atualiza dinamicamente conforme seleções

**Fluxo de uso:**
1. Professor marca dias disponíveis
2. Para cada dia marcado, aparece grid de horários
3. Professor seleciona horários específicos
4. Clica em "Salvar Configurações"
5. Dados enviados para API via `horariosService`

#### 4. ScheduleClassModal
**Arquivo:** `frontend/src/componentes/profile/modals/scheduleClassModal/ScheduleClassModal.jsx`

**Alterações principais:**
- Importa `horariosService`
- Novo prop: `professorId`
- State `horariosDisponiveis` agora é dinâmico (não mais hardcoded)
- `useEffect` para carregar horários ao abrir modal
- `useEffect` para atualizar horários quando data é selecionada

**Lógica de filtragem:**
```javascript
// Ao selecionar data no calendário:
const date = new Date(selectedDate);
const diaSemana = date.getDay(); // 0-6 (domingo-sábado)
const diaId = diasSemanaMap[diaSemana]; // 'segunda', 'terca', etc
const horariosParaDia = horariosPorDia[diaId] || [];
```

**Resultado:**
- Aluno vê apenas horários que o professor configurou para aquele dia da semana
- Horários atualizam automaticamente ao mudar a data no calendário

## Fluxo Completo de Uso

### 1. Professor Configurando Horários
1. Professor acessa DashProfessor
2. Seção "Horários Disponíveis" carrega dados existentes (se houver)
3. Professor marca dias da semana disponíveis
4. Para cada dia, seleciona horários específicos
5. Clica em "Salvar"
6. Frontend chama `POST /professor/horarios` com todos os horários
7. Backend deleta horários antigos e cria novos
8. Sucesso confirmado ao professor

### 2. Aluno Agendando Aula
1. Aluno abre perfil do professor
2. Clica em "Agendar Aula" (abre ScheduleClassModal)
3. Modal carrega horários do professor via `GET /professor/{id}/horarios`
4. Aluno seleciona data no calendário
5. Sistema filtra e exibe apenas horários disponíveis para aquele dia da semana
6. Aluno seleciona horário e confirma agendamento

## Validações

### Backend
- Formato de horário: "HH:MM"
- Hora válida: 00:00 - 23:59
- Dia da semana: Valores do enum DiaSemana
- Professor autenticado (endpoints protegidos)
- Horários duplicados: Permitido (mesmo horário em dias diferentes)

### Frontend
- Dia selecionado antes de mostrar horários
- Limite de horários baseado no pacote selecionado
- Validação de data mínima (não permitir datas passadas)

## Migration

### Executar Migration
```bash
# Conectar ao MySQL
mysql -u seu_usuario -p melofy_db

# Executar migration
source backend/database/migration_add_horarios_professor.sql
```

**Nota:** A migration é idempotente (`CREATE TABLE IF NOT EXISTS`), pode ser executada múltiplas vezes sem erro.

## Estrutura de Dados

### Request POST /professor/horarios
```json
{
  "horarios": [
    {"dia_semana": "Segunda", "horario": "09:00"},
    {"dia_semana": "Segunda", "horario": "10:00"},
    {"dia_semana": "Terça", "horario": "14:00"}
  ]
}
```

### Response (todos os endpoints GET)
```json
{
  "professor_id": 123,
  "horarios_por_dia": [
    {
      "dia_semana": "Segunda",
      "horarios": ["09:00", "10:00", "11:00"]
    },
    {
      "dia_semana": "Terça",
      "horarios": ["14:00", "15:00"]
    }
  ],
  "total_horarios": 5
}
```

## Testes Recomendados

### Backend
1. **POST /professor/horarios** - Criar horários bulk
2. **GET /professor/horarios** - Verificar autenticação
3. **GET /professor/{id}/horarios** - Testar acesso público
4. **DELETE implícito** - Verificar cascade ao deletar professor
5. **Substituição** - POST substitui corretamente horários antigos

### Frontend
1. **DashProfessor** - Carregar horários existentes ao montar
2. **DashProfessor** - Salvar horários modificados
3. **ScheduleClassModal** - Carregar horários ao abrir
4. **ScheduleClassModal** - Filtrar horários por dia da semana selecionado
5. **Integração** - Verificar que horários salvos aparecem para alunos

## Próximos Passos (Opcional)

1. **Validação de conflitos:** Verificar se horário já está agendado antes de permitir
2. **Horários recorrentes:** Professor definir exceções (feriados, férias)
3. **Timezone:** Adicionar suporte para fusos horários diferentes
4. **Notificações:** Alertar alunos quando professor adiciona novos horários
5. **Analytics:** Dashboard com estatísticas de horários mais populares

## Troubleshooting

### Erro: "Horários não aparecem no modal"
- Verificar se `professorId` está sendo passado corretamente
- Checar console do navegador para erros de API
- Confirmar que professor tem horários cadastrados no banco

### Erro: "Não consegue salvar horários"
- Verificar autenticação (cookie de sessão)
- Confirmar formato dos horários ("HH:MM")
- Checar logs do backend para erros de validação

### Erro: "Dias da semana incorretos"
- Verificar mapeamento `diasSemanaMap` no frontend
- Confirmar que ENUM do banco está com valores capitalizados
- Checar conversão de `getDay()` (0=domingo, 1=segunda...)
