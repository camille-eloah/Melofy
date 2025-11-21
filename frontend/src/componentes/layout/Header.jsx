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

  return (
    <header className="header">
      <h1 className="logo">Melofy 🎵</h1>
      <nav>
        <ul className="nav-list">
         
          <li><Link to="/musicas">Músicas</Link></li>
          <li><Link to={userId ? `/profile/${userId}` : '/profile'}>Perfil</Link></li>
          <li><Link to="/localizacao">Localização</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
