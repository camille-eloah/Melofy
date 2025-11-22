import { useNavigate } from "react-router-dom";
import "./Entrada.css";
import instrumentos from '../../assets/menina_violão.png'
import logoMelofy from "../../assets/Blue Modern Music Logo (1).png";


function Entrada() {
  const navigate = useNavigate();

  const handleCadastrar = () => {
    navigate("/cadastro");
  };

  const handleLogar = () => {
    navigate("/login");
  };


  return (

    <div className="entrada-page">
          <div className="melofy-container">
          <div className="melofy-descricao">
          <div className="melofy-logo">
            {/* <img src={logoMelofy} alt="Logo Melofy" /> */}
            <h1>MELOFY</h1>
          </div>
          <div className="melofy-slogan">
            <p>No Melofy, cada nota é um passo na sua</p>
            <p>jornada musical.</p>
          
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



          <div className="melofy-imagem">
            
            <img src={instrumentos} alt="Instrumentos" />
          </div>
        </div>
    </div>
  
  );
};

export default Entrada;
