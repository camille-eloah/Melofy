import './Header.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Header() {
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setUserId(data.id)
      })
      .catch(() => {})
  }, [])

  const profilePath = userId ? `/profile/${userId}` : '/profile'

  async function handleLogout(e) {
    e.preventDefault()

    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Erro ao fazer logout')
      }

      await Swal.fire({
        icon: 'success',
        title: 'Logout realizado',
        text: 'Você saiu da sua conta.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
        timerProgressBar: true,
      })

      // volta para a tela de login e substitui a página atual no histórico
      navigate('/login', { replace: true })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro ao sair',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
    }
  }

  return (
    <header className="main-header">
      <div className="header-left">
        <span className="brand">MELOFY</span>
      </div>

      <nav className="header-nav">
        <Link to="/home">Home</Link>

        {/* continua visualmente igual aos outros links */}
        <Link to="#" onClick={handleLogout}>
          Sair
        </Link>

        <Link to={profilePath}>Perfil</Link>
        <Link to="/localizacao">Localização</Link>
        <Link to="/feedback">Feedback</Link>
      </nav>
    </header>
  )
}

export default Header
