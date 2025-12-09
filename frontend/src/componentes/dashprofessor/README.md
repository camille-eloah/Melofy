# Estrutura de Diretórios - DashProfessor

## Organização Modular

Esta estrutura foi criada para manter o `DashProfessor.jsx` limpo e simples, enquanto cada lógica específica é encapsulada em módulos separados.

```
dashprofessor/
├── DashProfessor.jsx (componente principal)
├── DashProfessor.css (estilos principais)
├── README.md (este arquivo)
│
├── hooks/
│   └── useDashProfessor.js (futuro: hook principal para gerenciar estado)
│
├── services/
│   └── professorConfigService.js (chamadas à API de configurações)
│
└── modules/
    └── TipoAulaModal/
        ├── TipoAulaModal.jsx (componente)
        ├── TipoAulaModal.css (estilos específicos)
        ├── useTipoAula.js (hook customizado)
        └── tipoAulaService.js (lógicas e validações)
```

## Como Usar

### 1. TipoAulaModal

O componente `TipoAulaModal` encapsula toda a lógica de seleção de tipo de aula.

**Importar no DashProfessor.jsx:**

```jsx
import TipoAulaModal from './modules/TipoAulaModal/TipoAulaModal'
```

**Usar no formulário:**

```jsx
<TipoAulaModal
  tipoAula={tipoAula}
  setTipoAula={setTipoAula}
  linkGoogleMeet={linkGoogleMeet}
  setLinkGoogleMeet={setLinkGoogleMeet}
  localizacao={localizacao}
  handleLocalizacaoChange={handleLocalizacaoChange}
/>
```

### 2. tipoAulaService

Fornece funções úteis para validar e processar dados de tipo de aula:

```javascript
import { tipoAulaService } from './modules/TipoAulaModal/tipoAulaService'

// Validar tipo de aula
const validation = tipoAulaService.validateTipoAulaRequirements(
  tipoAula,
  linkGoogleMeet,
  localizacao
)

if (!validation.isValid) {
  console.log(validation.errors) // Array de erros
}

// Formatar dados antes de enviar à API
const formattedData = tipoAulaService.formatTipoAulaData(
  tipoAula,
  linkGoogleMeet,
  localizacao
)
```

### 3. useTipoAula Hook

Hook customizado que facilita o acesso às funções do serviço:

```jsx
const tipoAulaHook = useTipoAula(tipoAula, setTipoAula, linkGoogleMeet, localizacao)

// Mudar tipo de aula
tipoAulaHook.handleTipoAulaChange('remota')

// Validar
const validation = tipoAulaHook.validateCurrentTipoAula()

// Listar tipos disponíveis
const tipos = tipoAulaHook.getTiposAula()
```

## Próximos Módulos (Planejado)

```
├── modules/
    ├── TipoAulaModal/ ✓ (implementado)
    ├── ValorHoraModal/
    │   ├── ValorHoraModal.jsx
    │   ├── ValorHoraModal.css
    │   ├── useValorHora.js
    │   └── valorHoraService.js
    │
    ├── LocalizacaoModal/ (parte de TipoAulaModal)
    │
    └── RemotaModal/ (parte de TipoAulaModal)
```

## Boas Práticas

1. **Separação de Responsabilidades**: Cada arquivo tem uma função específica
   - `.jsx` = Componente React
   - `Service.js` = Lógica de negócio e validação
   - `Hook.js` = Integração com React (useState, useCallback, etc)
   - `.css` = Estilos (prefixados com nome do componente)

2. **Nomeação**: Prefixe classes CSS e funções com o nome do módulo
   - `.tipo-aula-...` para TipoAulaModal
   - `.valor-hora-...` para ValorHoraModal

3. **Reutilização**: Services são independentes de React e podem ser usados em qualquer lugar

4. **Testabilidade**: Services e hooks podem ser testados isoladamente

## Atualizando DashProfessor.jsx

Quando criar novos módulos, o `DashProfessor.jsx` apenas importará e usará os componentes:

```jsx
import TipoAulaModal from './modules/TipoAulaModal/TipoAulaModal'
import ValorHoraModal from './modules/ValorHoraModal/ValorHoraModal'
import LocalizacaoModal from './modules/LocalizacaoModal/LocalizacaoModal'

// No formulário:
<TipoAulaModal {...props} />
<ValorHoraModal {...props} />
<LocalizacaoModal {...props} />
```

Mantendo o arquivo principal limpo e fácil de manter!
