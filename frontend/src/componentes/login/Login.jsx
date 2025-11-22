import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, senha } = formData;

    if (!email || !senha) {
      setError('Preencha todos os campos!');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email,
        senha: senha, 
      };

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Não foi possível fazer login.');
      }

      // se a API devolver user/token, você pode salvar aqui
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      // redireciona para home depois de logar
      navigate('/home');
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Conteiner-login">
      <form onSubmit={handleSubmit}>
        <h1>Fazer Login</h1>

        {error && <div className="mensagem-erro">{error}</div>}

        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="digite seu email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Senha</label>
          <input
            type="password"
            id="senha"
            name="password"
            placeholder="Digite sua senha"
            value={formData.senha}
            onChange={handleChange}
          />
        </div>

        <div className="lembrar-senha">
          <label className="checkbox-label">
            <input type="checkbox" />
            <span className="checkmark"></span>
            Lembrar minha senha
          </label>
          <a href="#" className="esqueci-senha">
            Esqueci a senha
          </a>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'ENTRAR'}
        </button>

        <div className="cadastro-link">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;


  