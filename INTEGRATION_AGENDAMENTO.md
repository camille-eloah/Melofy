# Integração de Solicitação de Agendamento

## 📋 Resumo das Alterações

Esta atualização implementa a integração completa entre o frontend e backend para a funcionalidade de **solicitação de agendamento de aulas**, permitindo que alunos solicitem múltiplos horários para aulas com professores.

## 🗄️ Alterações no Banco de Dados

### 1. Tabela `tb_solicitacao_agendamento` - Atualizada

**Novas colunas:**
- `sol_prof_global_uuid` (CHAR(36)): UUID do professor
- `sol_alu_global_uuid` (CHAR(36)): UUID do aluno
- `sol_pac_id` (INT, NULL): Referência ao pacote escolhido
- `sol_modalidade` (ENUM): 'remota', 'presencial', 'domicilio'
- `sol_criado_em` (DATETIME): Timestamp de criação

**Colunas removidas:**
- `sol_horario` (substituído pela tabela `tb_solicitacao_horarios`)

### 2. Tabela `tb_solicitacao_horarios` - Nova

Armazena múltiplos horários para cada solicitação:

```sql
CREATE TABLE tb_solicitacao_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sol_id INT NOT NULL,
    horario_data DATE NOT NULL,
    horario_hora TIME NOT NULL,
    FOREIGN KEY (sol_id) REFERENCES tb_solicitacao_agendamento(sol_id) ON DELETE CASCADE
);
```

### 3. Tabela `tb_horarios_professor` - Nova (Para Futuro)

Preparação para permitir que professores definam seus próprios horários disponíveis:

```sql
CREATE TABLE tb_horarios_professor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prof_id INT NOT NULL,
    dia_semana ENUM('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prof_id) REFERENCES tb_professor(id) ON DELETE CASCADE
);
```

## 🔧 Migração do Banco de Dados

Execute o script de migração:

```bash
mysql -u seu_usuario -p db_melofy < backend/database/migration_update_solicitacao_agendamento.sql
```

**⚠️ IMPORTANTE:** Faça backup antes de executar a migração!

## 🐍 Alterações no Backend

### 1. Models (`backend/app/models.py`)

**Novos Enums:**
```python
class ModalidadeAula(str, Enum):
    remota = "remota"
    presencial = "presencial"
    domicilio = "domicilio"
```

**Modelo Atualizado:**
```python
class SolicitacaoAgendamento(SQLModel, table=True):
    sol_prof_global_uuid: str
    sol_alu_global_uuid: str
    sol_pac_id: Optional[int]
    sol_modalidade: ModalidadeAula
    sol_criado_em: datetime
    # ... outros campos
```

**Novo Modelo:**
```python
class SolicitacaoHorario(SQLModel, table=True):
    sol_id: int
    horario_data: date
    horario_hora: str  # HH:MM format
```

### 2. Schemas (`backend/app/schemas/agendamento.py`)

Novos schemas Pydantic para validação:

- `HorarioAgendamento`: Representa um horário (data + hora)
- `ModalidadeAgendamento`: Modalidade de aula selecionada
- `InstrumentoAgendamento`: Instrumento escolhido
- `PacoteAgendamento`: Pacote selecionado
- `SolicitacaoAgendamentoCreate`: Payload para criar solicitação
- `SolicitacaoAgendamentoRead`: Resposta com solicitação criada
- `SolicitacaoHorarioRead`: Horário individual da solicitação

### 3. Endpoint (`backend/app/main.py`)

**Novo endpoint:**
```
POST /schedule/agendamentos/
```

**Funcionalidades:**
- ✅ Autenticação obrigatória (apenas alunos)
- ✅ Validação de professor existente
- ✅ Validação de instrumento (pertence ao professor)
- ✅ Validação de pacote (pertence ao professor)
- ✅ Validação de quantidade de horários (deve corresponder ao pacote)
- ✅ Criação da solicitação e múltiplos horários
- ✅ Retorno com dados completos da solicitação

**Payload esperado:**
```json
{
  "agendamentos": [
    {"date": "2025-12-15", "time": "09:00"},
    {"date": "2025-12-17", "time": "14:00"}
  ],
  "pacote": {
    "pac_id": 1,
    "pac_nome": "Pacote 2 Aulas",
    "pac_quantidade_aulas": 2,
    "pac_valor_total": 200.00
  },
  "modalidade": {
    "id": "remota",
    "label": "Aula Remota (Google Meet)"
  },
  "instrumento": {
    "id": 2,
    "nome": "Guitarra"
  },
  "observacao": "Prefiro aulas pela manhã",
  "professor_id": 5
}
```

## ⚛️ Alterações no Frontend

### 1. ProfileUser.jsx

**Função `handleConfirmarAgendamento` - Atualizada:**

```javascript
const handleConfirmarAgendamento = async (dadosSolicitacao) => {
  // Prepara payload
  const payload = {
    agendamentos: dadosSolicitacao.agendamentos,
    pacote: { ... },
    modalidade: { ... },
    instrumento: { ... },
    observacao: dadosSolicitacao.observacao,
    professor_id: usuario.id,
  };

  // Envia POST para backend
  const response = await fetch("http://localhost:8000/schedule/agendamentos/", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Tratamento de resposta e erros
  // ...
};
```

### 2. ScheduleClassModal.jsx

**Sem alterações necessárias** - o modal já estava enviando os dados corretos via `handleConfirmarAgendamento`.

## 🔄 Fluxo Completo

1. **Aluno acessa perfil do professor** (`ProfileUser.jsx`)
2. **Clica em "Solicitar Agendamento"**
3. **Modal abre** (`ScheduleClassModal.jsx`) com:
   - Seleção de modalidade (Remota/Presencial/Domiciliar)
   - Seleção de instrumento
   - Seleção de pacote
   - Seleção de múltiplas datas/horários
   - Campo opcional de observação
4. **Aluno confirma** → SweetAlert de confirmação
5. **Dados enviados para backend** via `POST /schedule/agendamentos/`
6. **Backend valida:**
   - Autenticação (token JWT)
   - Professor existe
   - Instrumento pertence ao professor
   - Pacote pertence ao professor
   - Quantidade de horários corresponde ao pacote
7. **Backend cria:**
   - 1 registro em `tb_solicitacao_agendamento`
   - N registros em `tb_solicitacao_horarios` (conforme quantidade de aulas)
8. **Resposta retorna** com solicitação completa
9. **Frontend exibe sucesso** e fecha modal

## 📊 Estrutura de Dados

### Solicitação no Banco

```
tb_solicitacao_agendamento
├── sol_id: 1
├── sol_prof_id: 5
├── sol_prof_global_uuid: "abc-123..."
├── sol_alu_id: 10
├── sol_alu_global_uuid: "def-456..."
├── sol_instr_id: 2
├── sol_pac_id: 1
├── sol_modalidade: "remota"
├── sol_status: "Pendente"
├── sol_mensagem: "Prefiro aulas pela manhã"
└── sol_criado_em: "2025-12-09 14:30:00"

tb_solicitacao_horarios
├── id: 1, sol_id: 1, horario_data: "2025-12-15", horario_hora: "09:00"
└── id: 2, sol_id: 1, horario_data: "2025-12-17", horario_hora: "14:00"
```

## 🚀 Próximos Passos

### Curto Prazo
- [ ] Implementar listagem de solicitações para professores
- [ ] Implementar ações de aprovar/recusar solicitação
- [ ] Notificações em tempo real (WebSocket)

### Médio Prazo
- [ ] Implementar `tb_horarios_professor` (professores definem disponibilidade)
- [ ] Endpoint GET para horários disponíveis de um professor
- [ ] Atualizar `ScheduleClassModal` para usar horários reais
- [ ] Validação de conflito de horários

### Longo Prazo
- [ ] Sistema de pagamento integrado
- [ ] Calendário visual de aulas agendadas
- [ ] Histórico de solicitações

## 🧪 Testando a Integração

### 1. Verificar Backend

```bash
cd backend
# Ativar ambiente virtual
.\env\Scripts\Activate

# Rodar servidor
uvicorn app.main:app --reload
```

### 2. Verificar Frontend

```bash
cd frontend
npm run dev
```

### 3. Teste Manual

1. Faça login como **ALUNO**
2. Acesse perfil de um **PROFESSOR**
3. Clique em "Solicitar Agendamento"
4. Selecione:
   - Modalidade
   - Instrumento
   - Pacote (ex: 2 aulas)
   - 2 horários diferentes
   - Observação opcional
5. Clique em "Enviar solicitação"
6. Verifique:
   - SweetAlert de confirmação
   - SweetAlert de sucesso
   - Console do navegador (logs)
   - Banco de dados (registros criados)

### 4. Verificar Banco de Dados

```sql
SELECT * FROM tb_solicitacao_agendamento ORDER BY sol_criado_em DESC LIMIT 5;

SELECT sh.*, sa.sol_id 
FROM tb_solicitacao_horarios sh
JOIN tb_solicitacao_agendamento sa ON sh.sol_id = sa.sol_id
ORDER BY sa.sol_criado_em DESC, sh.horario_data, sh.horario_hora;
```

## ⚠️ Troubleshooting

### Erro: 403 Forbidden
- **Causa:** Não autenticado ou não é aluno
- **Solução:** Verificar se está logado como ALUNO

### Erro: 404 Professor/Instrumento/Pacote não encontrado
- **Causa:** IDs inválidos
- **Solução:** Verificar se dados existem no banco

### Erro: 400 Quantidade de horários incorreta
- **Causa:** Número de horários ≠ pac_quantidade_aulas
- **Solução:** Selecionar exatamente a quantidade do pacote

### Erro: 400 Professor não oferece este instrumento
- **Causa:** Instrumento não vinculado ao professor
- **Solução:** Verificar `tb_professor_instrumento`

## 📝 Notas Importantes

1. **Horários são fictícios**: Atualmente usa array hardcoded `["09:00", "10:30", "14:00", "16:00", "19:00"]`
2. **Status inicial**: Todas solicitações começam como "Pendente"
3. **Observação é opcional**: Campo pode ser null ou string vazia
4. **UUIDs são armazenados**: Para facilitar sincronização futura
5. **Pacote é opcional no schema do banco**: Preparado para aulas avulsas futuras

## 🔐 Segurança

- ✅ Autenticação via JWT obrigatória
- ✅ Validação de tipo de usuário (apenas alunos)
- ✅ Validação de relacionamentos (professor-instrumento, professor-pacote)
- ✅ Sanitização de inputs (max 500 chars para observação)
- ✅ Foreign keys com ON DELETE CASCADE

---

**Data:** 09/12/2025  
**Versão:** 1.0.0  
**Autor:** GitHub Copilot
