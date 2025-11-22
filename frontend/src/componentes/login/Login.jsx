import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import instrumentos from '../../assets/menino_tocando.png'
import Swal from 'sweetalert2'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function fazerLogin(e) {
    e.preventDefault()

    if (!email || !senha) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha usuário e senha.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        backdrop: 'rgba(0, 210, 255, 0.15)'
      })
      return
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, senha })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail || 'Usuário ou senha incorretos.')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Login realizado!',
        text: 'Bem-vindo de volta!',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      })

      navigate('/home')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao fazer login',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="left-content">
        <div className="text-content">
          <h1>Faça Login</h1>
          <h2>E entre para o nosso time!</h2>
        </div>
        <img src={instrumentos} alt="Menino tocando" className="menino" />
      </div>

      <div className="Conteiner-login">
        <form onSubmit={fazerLogin}>
          <h3>LOGIN</h3>

          <div className="input-group">
            <label>Usuário</label>
            <input
              type="text"
              placeholder="Nome cadastrado ou E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="opcoes">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <span className="checkmark"></span>
              Lembrar minha senha
            </label>
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'ENTRAR'}
          </button>

          <div className="cadastro-link">
            Não possui conta? <a href="/cadastro">Cadastre-se</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login