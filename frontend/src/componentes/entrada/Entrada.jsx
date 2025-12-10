import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Entrada.css";
import instrumentos from '../../assets/Images-Characters/menina_violão.png';
import jovem_aprendendo from '../../assets/Images-Characters/jovem_aprendendo.png'
import logoMelofy from "../../assets/Images-Logo/BlueLogo.png";

function Entrada() {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleCadastrar = () => {
    setShowRoleModal(true);
  };


  const escolherOpcao = (tipo) => {
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

      {showRoleModal && (
        <div className="role-choice-overlay">
          <div className="role-choice-modal new-role-modal">
            <div className="role-left">
              <h1 className="role-title">Aprender música, agora simples e acessível</h1>

              <p className="role-description">
                Melofy é a plataforma digital que conecta a paixão pela música ao conhecimento.
                De maneira simples e organizada, ligamos alunos de todos os níveis a professores ideais,
                seja para aulas online ou presenciais. Encontre o seu instrumento, a sua voz ou a sua teoria
                e comece a jornada musical que você sempre quis.
              </p>

              <div className="role-choice-buttons">
                <button
                  className="role-choice-btn student-btn"
                  onClick={() => navigate("/cadastro?role=aluno")}
                >
                  Para quem quer aprender
                </button>

                <button
                  className="role-choice-btn teacher-btn"
                  onClick={() => navigate("/cadastro?role=professor")}
                >
                  Para educadores musicais
                </button>
              </div>

              <button
                className="role-choice-close close-left"
                onClick={() => setShowRoleModal(false)}
              >
                Fechar
              </button>
            </div>

            <div className="role-right">
              <img
                src={jovem_aprendendo}
                alt="Ilustração musical"
              />
            </div>

          </div>
        </div>
      )}


    </div>
  );
}

export default Entrada;
