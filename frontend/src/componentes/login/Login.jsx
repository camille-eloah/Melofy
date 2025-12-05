import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import instrumentos from '../../assets/Images-Characters/menino_tocando.png'
import Swal from 'sweetalert2'
import './Login.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [lembrar, setLembrar] = useState(false)

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
      if (!res.ok) throw new Error(usuario.detail || "Erro ao fazer login");

      // Salva dados do usuário
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // -------- DEFINIR ROTA FINAL ANTES DO SweetAlert --------
      let rotaFinal = "/home";

      if (usuario.tipo_usuario === "PROFESSOR") {
        const resp = await fetch(`${API_BASE_URL}/instrumentos/professor/${usuario.id}`);
        const dados = await resp.json();
        const instrumentosExistentes = Array.isArray(dados) ? dados : [];

        // Se o professor NÃO tem instrumento → vai para instrumentos
        if (instrumentosExistentes.length === 0) {
          rotaFinal = "/instrumentos";
        }
      }

      // -------- SweetAlert e navegação final --------
      Swal.fire({
        icon: "success",
        title: "Login realizado",
        text: `Bem-vindo(a), ${usuario.nome}!`,
        background: "#1a1738",
        color: "#fff",
        confirmButtonColor: "#00d2ff",
      }).then(() => {
        // fromLogin evita redirecionamentos internos da página instrumentos
        navigate(rotaFinal, { replace: true, state: { fromLogin: true } });
      });

    } catch (error) {
      Swal.fire("Erro", error.message, "error");
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
            <label>Email</label>
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
            Não possui conta? <a href="/cadastro">Cadastre-se</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
