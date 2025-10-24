import './Header.css'

function Header() {
  return (
    <header className="header">
      <h1 className="logo">Melofy 🎵</h1>
      <nav>
        <ul className="nav-list">
          <li><a href="/home">Início</a></li>
          <li><a href="/musicas">Músicas</a></li>
          <li><a href="/perfil">Perfil</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
