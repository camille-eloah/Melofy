import { useState } from 'react'
import Swal from 'sweetalert2'
import './Feedback.css' 
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Feedback() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    // Validação simples (igual Flask)
    if (!nome || !email || !assunto || !mensagem) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha todos os campos.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
      return
    }

    const payload = {
      nome,
      email,
      assunto,
      mensagem,
    }

    setCarregando(true)

    try {
      const response = await fetch(`${API_BASE_URL}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.detail ?? 'Erro ao enviar feedback.')
      }

      Swal.fire({
        icon: 'success',
        title: 'Feedback enviado',
        text: data?.detail ?? 'Feedback enviado com sucesso! Obrigado pela sua opinião.',
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })

      // limpa o formulário
      setNome('')
      setEmail('')
      setAssunto('')
      setMensagem('')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.message,
        background: '#1a1738',
        color: '#fff',
        confirmButtonColor: '#00d2ff',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="feedback-page">
      <form className="feedback-form" onSubmit={handleSubmit}>
        <h2>Envie seu feedback</h2>

        <div className="input-group">
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
          />
        </div>

        <div className="input-group">
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <div className="input-group">
          <label>Assunto</label>
          <input
            type="text"
            value={assunto}
            onChange={(e) => setAssunto(e.target.value)}
            placeholder="Assunto do feedback"
          />
        </div>

        <div className="input-group">
          <label>Mensagem</label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Escreva aqui o seu feedback..."
            rows={4}
          />
        </div>

        <button type="submit" disabled={carregando}>
          {carregando ? 'Enviando...' : 'Enviar feedback'}
        </button>
      </form>
    </div>
  )
}

export default Feedback
