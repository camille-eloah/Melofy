import { useNavigate } from "react-router-dom";
import "./Entrada.css";
import teste from "../../assets/teste1.png";


function Entrada() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Área esquerda - textos */}
      <div className="landing-left">
        <h1 className="landing-title">MELOFY</h1>

        <h2 className="landing-subtitle">
          Soluções inovadoras<br />para sua jornada musical
        </h2>

        <p className="landing-description">
          No Melofy, cada nota é um passo na sua evolução musical.
        </p>

        <div className="landing-buttons">
          <button className="btn-primary" onClick={() => navigate("/cadastro")}>
            Cadastrar
          </button>

          <button className="btn-outline" onClick={() => navigate("/login")}>
            Logar
          </button>
        </div>
      </div>

      {/* Área da direita – espaço para imagem */}
      <div className="landing-right">
        <div className="container-onda"></div>
        <div className="image-placeholder">
           <img src={teste} />
        </div>
      </div>
    </div>
  );
}

export default Entrada;
