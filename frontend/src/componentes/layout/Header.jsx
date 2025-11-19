import './Header.css'

function Header() {
  return (
    <header className="profile-header">
      <div className="profile-header-left">

      <span className="brand">MELOFY</span>
      </div>

      <nav className="profile-header-nav">
        {/* <form onClick={()}> */}
          <a href='#'>Tela Inicial</a>
          <a href="#">Dar aulas</a>
          <a href="#">Conectar</a>
        {/* </form> */}

      </nav>
    </header>
  )
}

export default Header
