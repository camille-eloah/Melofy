# Componentes UI - Melofy

## SpinnerLoading

Componente de carregamento reutilizável com o ícone musical do Melofy.

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `size` | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Tamanho do spinner |
| `fullScreen` | `boolean` | `false` | Se `true`, exibe em tela cheia com fundo |
| `message` | `string` | `'Carregando...'` | Mensagem exibida abaixo do spinner |

### Exemplos de Uso

#### Spinner Básico (inline)
```jsx
import SpinnerLoading from '../ui/SpinnerLoading'

function MyComponent() {
  const [loading, setLoading] = useState(true)
  
  if (loading) {
    return <SpinnerLoading />
  }
  
  return <div>Conteúdo carregado</div>
}
```

#### Spinner em Tela Cheia
```jsx
import SpinnerLoading from '../ui/SpinnerLoading'

function MyComponent() {
  const [loading, setLoading] = useState(true)
  
  return (
    <>
      {loading && (
        <SpinnerLoading 
          fullScreen={true} 
          message="Carregando seus dados..." 
        />
      )}
      <div>Meu conteúdo</div>
    </>
  )
}
```

#### Spinner com Tamanhos Diferentes
```jsx
// Pequeno
<SpinnerLoading size="small" message="" />

// Médio (padrão)
<SpinnerLoading />

// Grande
<SpinnerLoading size="large" message="Aguarde..." />
```

#### Spinner Condicional
```jsx
function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <div className="profile-page">
      <Header />
      
      {isLoading ? (
        <SpinnerLoading 
          fullScreen={false} 
          message="Carregando perfil..." 
          size="large" 
        />
      ) : (
        <div className="profile-content">
          {/* Conteúdo do perfil */}
        </div>
      )}
      
      <Footer />
    </div>
  )
}
```

### Implementações Existentes

O componente já está sendo usado em:

- **Header.jsx** - Previne flicker do botão Dashboard enquanto carrega tipo de usuário
- **ProfileUser.jsx** - Exibe loading enquanto busca dados do perfil
- **DashProfessor.jsx** - Mostra loading durante carregamento inicial das configurações
- **TeacherList.jsx** - Indica carregamento da lista de professores

### Customização

O spinner usa as cores do tema Melofy:
- Cor principal: `#00d2ff` (cyan)
- Sombra com efeito neon
- Animação suave de rotação
- Background gradiente para modo fullScreen

### Acessibilidade

O componente é otimizado para:
- Responsividade (ajusta tamanhos em mobile)
- Animações suaves que não causam náusea
- Mensagens claras para screen readers
