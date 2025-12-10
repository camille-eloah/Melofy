import './Header.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import NotificationModal from './NotificationModal'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Header() {
  const [userId, setUserId] = useState(null)
  const [userUuid, setUserUuid] = useState(null)
  const [userTipo, setUserTipo] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [activeLink, setActiveLink] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setUserId(data.id)
        if (data?.global_uuid) setUserUuid(data.global_uuid)
        if (data?.tipo_usuario || data?.tipo) {
          const tipo = (data.tipo_usuario || data.tipo || '').toString().toLowerCase()
          setUserTipo(tipo || null)
        }
      })
      .catch(() => { })
  }, [])

  const profilePath = userUuid && userTipo ? `/${userTipo}/${userUuid}` : '/profile'

  const unreadCount = 2 // Temporário - será substituído pela lógica real de notificações

  async function handleLogout(e) {
    if (e?.preventDefault) e.preventDefault()
    setShowMenu(false)

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


  const handleLogoutClick = (e) => {
    e.preventDefault()
    handleLogout()
  }

  return (
    <header className="main-header">
     <div className="header-left">
  <Link to="/home">
    <span className="brand">
      <svg className="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18V5l12-2v13M9 18l12-2v3L9 21v-3z" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <span className="brand-text">MELOFY</span>
    </span>
  </Link>
</div>

      <nav className="header-nav">
        <Link
          to="/home"
          className={`nav-link ${activeLink === 'home' ? 'active' : ''}`}
          onMouseEnter={() => setActiveLink('home')}
          onMouseLeave={() => setActiveLink('')}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path d="M9 22V12h6v10" />
            </svg>
          </span>
          <span className="nav-text">Home</span>
          <span className="nav-glow"></span>
        </Link>

        {userTipo === 'professor' && (
          <Link
            to="/dashprofessor"
            className={`nav-link ${activeLink === 'dashboard' ? 'active' : ''}`}
            onMouseEnter={() => setActiveLink('dashboard')}
            onMouseLeave={() => setActiveLink('')}
          >
            <span className="nav-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
            <span className="nav-glow"></span>
          </Link>
        )}


        <Link
          to={profilePath}
          className={`nav-link ${activeLink === 'profile' ? 'active' : ''}`}
          onMouseEnter={() => setActiveLink('profile')}
          onMouseLeave={() => setActiveLink('')}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <span className="nav-text">Perfil</span>
          <span className="nav-glow"></span>
        </Link>

        <Link
          to="/localizacao"
          className={`nav-link ${activeLink === 'localizacao' ? 'active' : ''}`}
          onMouseEnter={() => setActiveLink('localizacao')}
          onMouseLeave={() => setActiveLink('')}
        >
          <span className="nav-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="nav-text">Localização</span>
          <span className="nav-glow"></span>
        </Link>

        <Link
          to="/feedback"
          className={`nav-link ${activeLink === 'feedback' ? 'active' : ''}`}
          onMouseEnter={() => setActiveLink('feedback')}
          onMouseLeave={() => setActiveLink('')}
        >
          <span className="nav-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </span>
          <span className="nav-text">Feedback</span>
          <span className="nav-glow"></span>
        </Link>

        <div className="notification-container">
          <button
            className={`notification-button ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="bell-wrapper">
              <svg
                className="bell-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>
            <span className="notification-pulse"></span>
          </button>

          <NotificationModal 
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
          />
        </div>

        <div className="logout-container">
          <button
            className="logout-button"
            onClick={handleLogoutClick}
            title="Sair da conta"
          >
            <div className="logout-icon-wrapper">
              <svg
                className="logout-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Header