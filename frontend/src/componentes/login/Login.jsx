import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import instrumentos from '../../assets/Images-Characters/menino_tocando.png'
import jovem_aprendendo from '../../assets/Images-Characters/jovem_aprendendo.png'
import Swal from 'sweetalert2'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false);

  const verificarInstrumentosProfessor = async (professorId, professorUuid) => {
    try {
      const url = professorUuid
        ? `${API_BASE_URL}/instruments/professor/uuid/${professorUuid}`
        : `${API_BASE_URL}/instruments/professor/${professorId}`;
      const resp = await fetch(url, { credentials: "include" });
      if (!resp.ok) return false;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) return true;
      if (Array.isArray(data?.instrumentos) && data.instrumentos.length > 0) return true;
    } catch (error) {
      console.warn("Falha ao verificar instrumentos do professor", error);
    }
    return false;
  };



  async function handleLogin(e) {
    e.preventDefault();
    setCarregando(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const usuario = await res.json();
      console.log("Usuário retornado:", usuario);

      if (!res.ok) {
        throw new Error(usuario.detail || "Erro ao fazer login");
      }

      // salva no localStorage para uso em outras páginas
      localStorage.setItem("usuario", JSON.stringify(usuario));

      Swal.fire({
        icon: "success",
        title: "Login realizado",
        text: `Bem-vindo(a), ${usuario.nome}!`,
        background: "#1a1738",
        color: "#fff",
        confirmButtonColor: "#00d2ff",
      }).then(() => {
        // redirecionamento conforme tipo do usuário
        if (usuario.tipo_usuario === "ALUNO") {
          navigate("/home", { replace: true });
        } else if (usuario.tipo_usuario === "PROFESSOR") {
          verificarInstrumentosProfessor(usuario.id, usuario.global_uuid).then((possuiInstrumentos) => {
            if (possuiInstrumentos) {
              navigate(`/professor/${usuario.global_uuid || usuario.id}`, { replace: true });
            } else {
              navigate("/instrumentos", { replace: true });
            }
          });
        }
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login",
        text: error.message,
        background: "#1a1738",
        color: "#fff",
        confirmButtonColor: "#00d2ff",
      });
    } finally {
      setCarregando(false);
    }
  }


  return (
    <div className="login-page">
      <div className="left-content">
        <div className="text-content">
          <h1>Faça Login</h1>
          <h2>E entre para o nosso time!</h2>
        </div>
        <img src={instrumentos} alt="Menino tocando" className="menino" />
      </div>

      <div className="Conteiner-login">
        <form onSubmit={handleLogin}>
          <h3>LOGIN</h3>

          <div className="input-group">
            <label>Usuário</label>
            <input
              type="text"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="opcoes">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
              />
              <span className="checkmark"></span>
              Lembrar minha senha
            </label>
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'ENTRAR'}
          </button>

          <div className="cadastro-link">
            Não possui conta?
            <span className="cadastre-link-text" onClick={() => setShowRoleModal(true)}> Cadastre-se</span>
          </div>


        </form>
      </div>
      {showRoleModal && (
        <div className="role-choice-overlay">
          <div className="role-choice-modal new-role-modal">

            {/* LADO ESQUERDO */}
            <div className="role-left">
              <h1 className="role-title">Aprender música, agora simples e acessível</h1>

              <p className="role-description">
                Melofy é a plataforma digital que conecta a paixão pela música ao conhecimento.
                De maneira simples e organizada, ligamos alunos de todos os níveis a professores ideais,
                seja para aulas online ou presenciais. Encontre o seu instrumento e comece a jornada musical.
              </p>

              <div className="role-choice-buttons">
                <button
                  className="role-choice-btn student-btn"
                  onClick={() => {
                    setShowRoleModal(false);
                    navigate("/cadastro?role=aluno");
                  }}
                >
                  Para quem quer aprender
                </button>

                <button
                  className="role-choice-btn teacher-btn"
                  onClick={() => {
                    setShowRoleModal(false);
                    navigate("/cadastro?role=professor");
                  }}
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

            {/* LADO DIREITO */}
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
  )
}

export default Login;
