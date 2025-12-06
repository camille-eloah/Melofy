import { useState } from 'react'
import { useEffect } from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import instrumentos from '../../assets/Images-Characters/saxofonista.png'
import Swal from 'sweetalert2'
import './Cadastro.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Cadastro() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const tipoEscolhido = queryParams.get("role"); // "professor" ou "aluno"
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  const formatarCPF = (valor) => {
    return valor
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const handleCpfChange = (e) => {
    setCpf(formatarCPF(e.target.value))
  }

  async function cadastrarUsuario(e) {
    e.preventDefault()

    if (!nome || cpf.replace(/\D/g, '').length !== 11 || !dataNascimento || !email || !senha || !confirmarSenha) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos corretamente.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
      return
    }

    if (senha !== confirmarSenha) {
      Swal.fire({
        icon: 'error',
        title: 'Senhas diferentes',
        text: 'As senhas não conferem. Tente novamente.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
      return
    }

    const payload = {
      nome,
      cpf: cpf.replace(/\D/g, ''),
      data_nascimento: dataNascimento,
      email,
      senha,
      tipo: tipoEscolhido
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Erro ao cadastrar. Tente novamente.')
      }

      Swal.fire({
        icon: 'success',
        title: 'Cadastrado com sucesso!',
        text: tipoEscolhido === "professor"
          ? 'Agora escolha os instrumentos que você ensina.'
          : 'Bem-vindo! Vamos para a plataforma.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
        timer: 2000
      })

      // redirecionamento pelo tipo
      if (tipoEscolhido === "professor") {
        navigate("/instrumentos");
      } else {
        navigate("/home");
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro no cadastro',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    const valido = tipoEscolhido === "aluno" || tipoEscolhido === "professor";

    if (!valido) {
      navigate("/", { replace: true });
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

          <div className="linha-dupla">
            <div className="input-group">
              <label>Senha</label>
              <input
                type="password"
                placeholder="Crie uma senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'CADASTRAR'}
          </button>

          <div className="cadastro-link">
            Já tem uma conta? <a href="/login">Faça Login</a>
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
  )
}

export default Cadastro
