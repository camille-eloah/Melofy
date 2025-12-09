import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import instrumentos from '../../assets/Images-Characters/saxofonista.png';
import Swal from 'sweetalert2';
import './Cadastro.css';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigito = (base) => {
    let soma = 0;
    let peso = base.length + 1;

    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * peso--;
    }

    const resto = (soma * 10) % 11;
    return resto === 10 || resto === 11 ? 0 : resto;
  };

  const base = cpf.slice(0, 9);
  const digito1 = calcularDigito(base);
  const digito2 = calcularDigito(base + digito1);

  return cpf === base + digito1 + digito2;
}

function validarSenha(senha) {
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(senha);
}

function Cadastro() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const tipoEscolhido = queryParams.get('role');

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e) => {
    setCpf(formatarCPF(e.target.value));
  };

  const handleSocialLogin = (provider) => {
    Swal.fire({
      title: 'Em breve disponível',
      text: `O cadastro com ${provider} estará disponível em breve!`,
      icon: 'info',
      background: '#1a1738',
      color: '#fff',
      confirmButtonColor: '#00d2ff',
    });
  };

  async function cadastrarUsuario(e) {
    e.preventDefault();

    if (!validarCPF(cpf)) {
      Swal.fire({
        icon: 'error',
        title: 'CPF inválido',
        text: 'Digite um CPF válido.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      });
      return;
    }

   if (!nome) {
  return Swal.fire({ icon: 'warning', title: 'Nome obrigatório', text: 'Digite seu nome.' });
}

if (cpf.replace(/\D/g, '').length !== 11) {
  return Swal.fire({ icon: 'warning', title: 'CPF incompleto', text: 'Digite os 11 dígitos do CPF.' });
}

if (!dataNascimento) {
  return Swal.fire({ icon: 'warning', title: 'Data obrigatória', text: 'Digite sua data de nascimento.' });
}

if (!email) {
  return Swal.fire({ icon: 'warning', title: 'E-mail obrigatório', text: 'Digite seu e-mail.' });
}

if (!senha) {
  return Swal.fire({ icon: 'warning', title: 'Senha obrigatória', text: 'Digite sua senha.' });
}

if (!confirmarSenha) {
  return Swal.fire({ icon: 'warning', title: 'Confirmação obrigatória', text: 'Confirme sua senha.' });
}


    if (!validarSenha(senha)) {
      Swal.fire({
        icon: 'error',
        title: 'Senha fraca',
        text: 'A senha deve ter no mínimo 8 caracteres, incluindo pelo menos 1 letra maiúscula e 1 número.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      });
      return;
    }

    if (senha !== confirmarSenha) {
      Swal.fire({
        icon: 'error',
        title: 'Senhas diferentes',
        text: 'As senhas não conferem. Tente novamente.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      });
      return;
    }

    const payload = {
      nome,
      cpf: cpf.replace(/\D/g, ''),
      data_nascimento: dataNascimento,
      email,
      senha,
      tipo: tipoEscolhido,
    };

    setCarregando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Erro ao cadastrar. Tente novamente.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Cadastrado com sucesso!',
        text:
          tipoEscolhido === 'professor'
            ? 'Agora escolha os instrumentos que você ensina.'
            : 'Bem-vindo! Vamos para a plataforma.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000,
      });

      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (tipoEscolhido !== 'aluno' && tipoEscolhido !== 'professor') {
      navigate('/notfound', { replace: true });
    }
  }, [tipoEscolhido, navigate]);

  return (
    <div className="cadastro-page">
      <div className="Conteiner-cadastro">
        <form onSubmit={cadastrarUsuario}>
          <h3>CADASTRO</h3>

          <div className="input-group">
            <label>Nome Completo</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="linha-dupla">
            <div className="input-group">
              <label>CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                maxLength="14"
              />
            </div>

            <div className="input-group">
              <label>Data de Nascimento</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group senha-group">
            <div className="label-row">
              <label>Senha</label>
              
            </div>
            <div className='input-senha'>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              
            />
        
            <button
                type="button"
                className="btn-mostrar-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          
          <div className="input-group senha-group">
            <div className="label-row">
              <label>Confirmar Senha</label>
              
            </div>
            <div className='input-senha'>
            <input
              type={mostrarConfirmarSenha ? 'text' : 'password'}
              placeholder="Repita a senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}/>
      
            <button
                type="button"
                className="btn-mostrar-senha"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              >
                {mostrarConfirmarSenha ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          
          <button type="submit" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'CADASTRAR'}
          </button>

          
          <div className="cadastro-link">
            Já tem uma conta? <a href="/login">Faça Login</a>
          </div>


          <div className="social-section">
            <p className="social-title">Ou cadastre-se com</p>

            <div className="social-icons">
              <button
                type="button"
                className="social-icon-btn google"
                onClick={() => handleSocialLogin('Google')}
                aria-label="Cadastrar com Google"
              >
                <FcGoogle className="icon" />
              </button>

              <button
                type="button"
                className="social-icon-btn facebook"
                onClick={() => handleSocialLogin('Facebook')}
                aria-label="Cadastrar com Facebook"
              >
                <FaFacebook className="icon" />
              </button>

              <button
                type="button"
                className="social-icon-btn instagram"
                onClick={() => handleSocialLogin('Instagram')}
                aria-label="Cadastrar com Instagram"
              >
                <FaInstagram className="icon" />
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="right-content">
        <div className="text-content">
          <h1>Crie sua conta</h1>
          <h2>E comece a aprender hoje!</h2>
        </div>

        <img src={instrumentos} alt="Menino tocando" className="menino" />
      </div>
    </div>
  );
}

export default Cadastro;
