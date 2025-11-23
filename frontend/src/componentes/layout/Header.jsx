import './Header.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Header() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setUserId(data.id)
      })
      .catch(() => {})
  }, [])

  const profilePath = userId ? `/profile/${userId}` : '/profile'

  return (
    <header className="main-header">
      <div className="header-left">
        <span className="brand">MELOFY</span>
      </div>

      <nav className="header-nav">
        <Link to="/home">Home</Link>
        <Link to={profilePath}>Perfil</Link>
        <Link to="/localizacao">Localização</Link>
      </nav>
    </header>
  )
}

export default Header
