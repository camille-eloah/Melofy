import { useState } from 'react'
import './Cadastro.css'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Cadastro() {
  const [mostrar, setMostrar] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [tipo, setTipo] = useState('')
  const [mensagemErro, setMensagemErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function cadastrarUsuario(event) {
    event.preventDefault()
    setMostrar(false)
    setMensagemErro('')

    if (!nome || !cpf || !dataNascimento || !email || !senha || !tipo) {
      setMensagemErro('Preencha todos os campos obrigatórios.')
      return
    }

    if (senha !== confirmarSenha) {
      setMensagemErro('As senhas não conferem.')
      return
    }

    const payload = {
      nome,
      cpf: cpf.replace(/\D/g, ''),
      data_nascimento: dataNascimento,
      email,
      senha,
      tipo: tipo.toUpperCase()
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_BASE_URL}/user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Não foi possível concluir o cadastro.')
      }

      setMostrar(true)
      setNome('')
      setCpf('')
      setDataNascimento('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')
      setTipo('')
    } catch (error) {
      setMensagemErro(error.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="Conteiner">
      <form onSubmit={cadastrarUsuario}>
        <h1>Cadastre-se</h1>

        <div className="input-group">
          <label className="input-label">Nome Completo</label>
          <input
            type="text"
            id="nome"
            placeholder="Digite seu nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="linha-dupla">
          <div className="input-group">
            <label className="input-label">CPF</label>
            <input
              type="text"
              id="cpf"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Data de Nascimento</label>
            <input
              type="date"
              id="nascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input
            type="email"
            id="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="linha-dupla">
          <div className="input-group">
            <label className="input-label">Senha</label>
            <input
              type="password"
              id="senha"
              placeholder="Crie uma senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              placeholder="Confirme sua senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Tipo de Usuário</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Selecione...</option>
            <option value="Professor">Professor</option>
            <option value="Aluno">Aluno</option>
          </select>
        </div>

        <button
          className="melofy-btn cadastrar-btn"
          type="submit"
          disabled={carregando}
        >
          {carregando ? 'Enviando...' : 'Cadastrar'}
        </button>

        <div className="cadastro-link">
          Já tem uma conta? <a href="/login">Faça Login</a>
        </div>

        {mensagemErro && (
          <div className="mensagem-erro">{mensagemErro}</div>
        )}

        {mostrar && (
          <div className="mensagem-sucesso">
            <span className="icone-sucesso">✓</span>
            Usuário cadastrado com sucesso!
          </div>
        )}
      </form>
    </div>
  )
}

export default Cadastro
