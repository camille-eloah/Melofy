import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Entrada.css";
import instrumentos from '../../assets/Images-Characters/menina_violão.png';
import logoMelofy from "../../assets/Images-Logo/BlueLogo.png";

function Entrada() {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleCadastrar = () => {
    setShowRoleModal(true);
  };


  const escolherOpcao = (tipo) => {
    // salva a escolha temporariamente
    localStorage.setItem("tipoCadastro", tipo);

    navigate("/cadastro");
  };

  const handleLogar = () => navigate("/login");

  return (
    <div className="entrada-page">
      <div className="melofy-container">
        <div className="melofy-descricao">
          <div className="melofy-logo">
            <h1>MELOFY</h1>
          </div>

          <div className="melofy-slogan">
            <p>No Melofy, cada nota é um passo na sua</p>
            <p>jornada musical.</p>

            <div className="melofy-buttons">
              <button
                className="melofy-btn cadastrar-btn"
                onClick={handleCadastrar}
              >
                Cadastrar
              </button>

              <button
                className="melofy-btn logar-btn"
                onClick={handleLogar}
              >
                Logar
              </button>
            </div>
          </div>
        </div>

        <div className="melofy-imagem">
          <img src={instrumentos} alt="Instrumentos" />
        </div>
      </div>

      {/* Modal */}
      {showRoleModal && (
        <div className="role-choice-overlay">
          <div className="role-choice-modal">
            <h2>Como você deseja continuar?</h2>

            <div className="role-choice-buttons">
              <button
                className="role-choice-btn teacher-btn"
                onClick={() => navigate("/cadastro?role=professor")}
              >
                Quero ensinar
              </button>

              <button
                className="role-choice-btn student-btn"
                onClick={() => navigate("/cadastro?role=aluno")}
              >
                Quero aprender
              </button>
            </div>

            <button
              className="role-choice-close"
              onClick={() => setShowRoleModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Entrada;
