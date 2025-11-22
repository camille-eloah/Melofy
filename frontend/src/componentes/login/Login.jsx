import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function fazerLogin(e) {
    e.preventDefault()
    setMensagemErro('')

    if (!email || !senha) {
      setMensagemErro('Preencha todos os campos!')
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Não foi possível fazer o login.')
      }

      navigate('/home')
    } catch (error) {
      setMensagemErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

    return(
       <div className="login-page">
         <div className="Conteiner-login">
           <form onSubmit={fazerLogin}>
                <h1>Fazer Login</h1>
                
                <div className="input-group">
                    <label className="input-label">E-mail</label>
                    <input 
                        type="email" 
                        id='email' 
                        placeholder="Digite seu email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                
                <div className="input-group">
                    <label className="input-label">Senha</label>
                    <input 
                        type="password" 
                        id='senha' 
                        placeholder="Digite sua senha" 
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)} 
                    />
                </div>

                <div className="lembrar-senha">
                    <label className="checkbox-label">
                        <input type="checkbox" />
                        <span className="checkmark"></span>Lembrar minha senha</label>
                    <a href="#" className="esqueci-senha">Esqueci a senha</a>
                </div>

                <button type="submit" disabled={carregando}>
                    {carregando ? 'Entrando...' : 'ENTRAR'}
                </button>

                <div className="cadastro-link">
                    Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
                </div>

                {mensagemErro && (
                    <div className="mensagem-erro">
                        {mensagemErro}
                    </div>
                )}
           </form>
         </div>
       </div>
    )
}

export default Login
