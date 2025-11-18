import { useNavigate } from "react-router-dom";
import "./Entrada.css";

function Entrada() {
  const navigate = useNavigate();

  const handleCadastrar = () => {
    navigate("/cadastro");
  };

  const handleLogar = () => {
    navigate("/login");
  };


  return (
    <div className="melofy-container">
      <div className="melofy-background">
        <div className="melofy-content">
          <div className="melofy-logo">
            <h1>MELOFY</h1>
          </div>
          <div className="melofy-slogan">
            <p>No Melofy, cada nota é um passo na sua</p>
            <p>jornada musical.</p>
          </div>
          <div className="melofy-buttons">
            <button 
              className="melofy-btn cadastrar-btn"
              onClick={handleCadastrar}>
              Cadastrar
            </button>
            <button className="melofy-btn logar-btn"
              onClick={handleLogar}>
              Logar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entrada;