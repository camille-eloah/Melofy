import { useState } from 'react'
import Swal from 'sweetalert2'
import './FeedBack.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function Feedback() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [assunto, setAssunto] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

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
      <Header />
      <div className="feedback-container">
        <div className="feedback-content">
          <div className="feedback-intro">
            <div className="intro-content">
              <h1>Compartilhe sua experiência</h1>
              <p>Sua opinião é essencial para melhorarmos continuamente nosso serviço. Envie suas sugestões, críticas ou elogios e ajude-nos a crescer.</p>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon-circle">
                      <svg className="feature-svg" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="feature-text">
                    <h3>Resposta rápida</h3>
                    <p>Retornamos o seu contato o mais rápido possível.</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon-circle">
                      <svg className="feature-svg" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="feature-text">
                    <h3>Privacidade garantida</h3>
                    <p>Seus dados são protegidos com criptografia de ponta</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon-wrapper">
                    <div className="feature-icon-circle">
                      <svg className="feature-svg" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="feature-text">
                    <h3>Melhorias contínuas</h3>
                    <p>Cada feedback contribui para nosso crescimento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-wrapper">
            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className="form-header">
                <h2>Formulário de Feedback</h2>
                <p>Preencha os campos abaixo com suas informações</p>
              </div>

              <div className="form-inputs">
                <div className="input-row">
                  <div className="input-group-feedback">
                    <label>
                      <span className="label-text">Nome</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className={nome ? 'filled' : ''}
                    />
                  </div>
                </div>
                <div className="input-group-feedback">
                    <label>
                      <span className="label-text">E-mail</span>
                      <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className={email ? 'filled' : ''}
                    />
                  </div>

                <div className="input-group-feedback">
                  <label>
                    <span className="label-text">Assunto</span>
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    placeholder="Digite o assunto do seu feedback"
                    className={assunto ? 'filled' : ''}
                  />
                </div>

                <div className="input-group-feedback">
                  <label>
                    <span className="label-text">Mensagem</span>
                    <span className="required">*</span>
                  </label>
                  <div className="textarea-container">
                    <textarea
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      placeholder="Descreva detalhadamente seu feedback, sugestão ou experiência..."
                      rows={5}
                      className={mensagem ? 'filled' : ''}
                    />
                    <div className="textarea-counter">{mensagem.length}/500</div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={carregando} className="submit-button">
                {carregando ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Feedback'
                )}
              </button>
            </form>
          </div>
          <ChatButton />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Feedback