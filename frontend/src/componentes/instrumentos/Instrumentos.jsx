import "./Instrumentos.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import saxofone from '../../assets/saxofone.png';
import guitarra from '../../assets/guitarra.png';
import violao from '../../assets/violao.png';
import baixo from '../../assets/baixo.png';
import flauta from '../../assets/flauta.png';
import teclado from '../../assets/teclado.png';
import violino from '../../assets/violino.png';
import canto from '../../assets/canto.png';
import menino from '../../assets/menino apontando.png';
import partitura from '../../assets/partitura.png';
import sanfona from '../../assets/sanfona.png';


const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Instrumentos() {

return (
    <div className="instrumentos-page">
<header className="instrumentos-header">
        <div className="instrumentos-header-left">
          <span className="brand">MELOFY</span>
        </div>

        <nav className="instrumentos-header-nav">
          <Link to="/home">Tela Inicial</Link>
          <a href="#">Conectar</a>
        </nav>
      </header>
      <div className="instrumentos-content">

      <h1>Prof.() escolha os instrumentos que deseja ensinar!</h1>
      <h2>Estamos quase finalizando seu cadastro...
      </h2>
    <div className="instrumentos-circles-container">
    <div className="instrumentos-circle"><img src={saxofone} alt="Saxofone" /><span className="instrumentos-circle-text">Saxofone</span></div>
    <div className="instrumentos-circle"><img src={guitarra} alt="Guitarra" /><span className="instrumentos-circle-text">Guitarra</span></div>
    <div className="instrumentos-circle"><img src={violao} alt="Violão" /><span className="instrumentos-circle-text">Violão</span></div>
    
    <div className="instrumentos-circle"><img src={flauta} alt="Flauta" /><span className="instrumentos-circle-text">Flauta</span></div>
    <div className="instrumentos-circle"><img src={partitura} alt="Partitura" /><span className="instrumentos-circle-text">Partitura</span></div>
    </div>
    <div className="instrumentos-circles-container">
    <div className="instrumentos-circle"><img src={baixo} alt="Baixo" /><span className="instrumentos-circle-text">Baixo</span></div>
    <div className="instrumentos-circle"><img src={violino} alt="Violino" /><span className="instrumentos-circle-text">Violino</span></div>
    <div className="instrumentos-circle"><img src={canto} alt="Canto" /><span className="instrumentos-circle-text">Canto</span></div>
    <div className="instrumentos-circle"><img src={teclado} alt="Teclado" /><span className="instrumentos-circle-text">Teclado</span></div>
    <div className="instrumentos-circle"><img src={sanfona} alt="Sanfona" /><span className="instrumentos-circle-text">Acordeon</span></div>
    <img className="menino" src={menino} alt="Menino Tocando" />
    </div>
    </div>
    


    </div>

  )
}

export default Instrumentos;