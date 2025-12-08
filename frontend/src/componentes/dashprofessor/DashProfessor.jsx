import { useState } from 'react'
import Swal from 'sweetalert2'
import './DashProfessor.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'
import { 
  FaMoneyBillWave, 
  FaChalkboardTeacher, 
  FaVideo, 
  FaMapMarkerAlt, 
  FaHome,
  FaSave,
  FaInfoCircle,
  FaCity,
  FaMapPin,
  FaRoad,
  FaHashtag,
  FaBuilding,
  FaLink
} from 'react-icons/fa'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

function DashProfessor() {
  const [valorHora, setValorHora] = useState('')
  const [tipoAula, setTipoAula] = useState('')
  const [linkGoogleMeet, setLinkGoogleMeet] = useState('')
  const [localizacao, setLocalizacao] = useState({
    cidade: '',
    estado: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: ''
  })
  const [loading, setLoading] = useState(false)

  // Opções de tipos de aula
  const tiposAula = [
    { id: 'domicilio', label: 'Aula Domiciliar', icon: <FaHome /> },
    { id: 'presencial', label: 'Aula Presencial', icon: <FaBuilding /> },
    { id: 'remota', label: 'Aula Remota', icon: <FaVideo /> }
  ]

  const handleLocalizacaoChange = (field, value) => {
    setLocalizacao(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!valorHora || !tipoAula) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor, preencha o valor da hora e selecione o tipo de aula.',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (tipoAula === 'remota' && !linkGoogleMeet) {
      Swal.fire({
        icon: 'warning',
        title: 'Link necessário',
        text: 'Para aulas remotas, é necessário informar o link do Google Meet.',
        confirmButtonColor: '#2563eb'
      })
      return
    }

    if (tipoAula === 'presencial') {
      const { cidade, estado, rua, numero, bairro } = localizacao
      if (!cidade || !estado || !rua || !numero || !bairro) {
        Swal.fire({
          icon: 'warning',
          title: 'Localização incompleta',
          text: 'Para aulas presenciais, preencha todos os campos obrigatórios da localização.',
          confirmButtonColor: '#2563eb'
        })
        return
      }
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/professor/configuracoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valor_hora: parseFloat(valorHora),
          tipo_aula: tipoAula,
          link_meet: linkGoogleMeet,
          localizacao: tipoAula === 'presencial' ? localizacao : null
        })
      })

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Configurações salvas!',
          text: 'Suas configurações foram atualizadas com sucesso.',
          confirmButtonColor: '#059669',
          background: '#ffffff',
          color: '#111827'
        })
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Ocorreu um erro ao salvar as configurações. Tente novamente.',
        confirmButtonColor: '#dc2626'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
          {/* Header do Dashboard */}
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <h1 className="dashboard-title">Dashboard do Professor</h1>
              <p className="dashboard-subtitle">
                Configure suas preferências de aula e valores de forma personalizada
              </p>
            </div>
          </div>

          <div className="dashboard-content">
            <form onSubmit={handleSubmit} className="config-form">
              {/* Seção: Valor da Hora de Aula */}
              <div className="config-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <FaMoneyBillWave className="section-icon" />
                  </div>
                  <div className="section-title-wrapper">
                    <h2 className="section-title">Valor da Hora de Aula</h2>
                    <p className="section-description">
                      Defina o valor por hora das suas aulas particulares
                    </p>
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">
                    Valor por hora (R$)
                  </label>
                  <div className="valor-input-wrapper">
                    <span className="input-prefix">R$</span>
                    <input
                      type="number"
                      value={valorHora}
                      onChange={(e) => setValorHora(e.target.value)}
                      placeholder="0,00"
                      min="0"
                      step="0.01"
                      className="simple-input"
                      required
                    />
                  </div>
                  <small className="input-hint">
                    Exemplo: 80,00 (oitenta reais por hora)
                  </small>
                </div>
              </div>

              {/* Seção: Tipo de Aula */}
              <div className="config-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <FaChalkboardTeacher className="section-icon" />
                  </div>
                  <div className="section-title-wrapper">
                    <h2 className="section-title">Modalidade de Aula</h2>
                    <p className="section-description">
                      Selecione como você prefere ministrar suas aulas
                    </p>
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">
                    Selecione o tipo de aula
                  </label>
                  <div className="tipo-aula-grid">
                    {tiposAula.map((tipo) => (
                      <div
                        key={tipo.id}
                        className={`tipo-aula-option ${tipoAula === tipo.id ? 'selected' : ''}`}
                        onClick={() => setTipoAula(tipo.id)}
                      >
                        <div className="option-icon-wrapper">
                          {tipo.icon}
                        </div>
                        <span className="option-label">{tipo.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condicional: Link Google Meet (para aulas remotas) */}
                {tipoAula === 'remota' && (
                  <div className="conditional-section">
                    <div className="conditional-header">
                      <div className="conditional-icon-wrapper">
                        <FaVideo className="conditional-icon" />
                      </div>
                      <div>
                        <h3 className="conditional-title">Link da Sala Virtual</h3>
                        <p className="conditional-description">
                          Insira o link do Google Meet para suas aulas remotas
                        </p>
                      </div>
                    </div>
                    <div className="input-group">
                      <div className="link-input-wrapper">
                        <FaLink className="input-icon" />
                        <input
                          type="url"
                          value={linkGoogleMeet}
                          onChange={(e) => setLinkGoogleMeet(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij"
                          className="simple-input"
                          required={tipoAula === 'remota'}
                        />
                      </div>
                      <small className="input-hint">
                        Este link será compartilhado com seus alunos antes das aulas
                      </small>
                    </div>
                  </div>
                )}

                {/* Condicional: Localização (para aulas presenciais) */}
                {tipoAula === 'presencial' && (
                  <div className="conditional-section">
                    <div className="conditional-header">
                      <div className="conditional-icon-wrapper">
                        <FaMapMarkerAlt className="conditional-icon" />
                      </div>
                      <div>
                        <h3 className="conditional-title">Local da Aula</h3>
                        <p className="conditional-description">
                          Informe onde serão realizadas as aulas presenciais
                        </p>
                      </div>
                    </div>
                    
                    <div className="localizacao-grid">
                      <div className="input-group">
                        <label className="input-label">
                          <FaCity className="input-label-icon" /> Cidade
                        </label>
                        <input
                          type="text"
                          value={localizacao.cidade}
                          onChange={(e) => handleLocalizacaoChange('cidade', e.target.value)}
                          placeholder="Digite a cidade"
                          className="simple-input"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FaMapPin className="input-label-icon" /> Estado
                        </label>
                        <input
                          type="text"
                          value={localizacao.estado}
                          onChange={(e) => handleLocalizacaoChange('estado', e.target.value)}
                          placeholder="Ex: SP, RJ, MG"
                          className="simple-input"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FaRoad className="input-label-icon" /> Rua/Avenida
                        </label>
                        <input
                          type="text"
                          value={localizacao.rua}
                          onChange={(e) => handleLocalizacaoChange('rua', e.target.value)}
                          placeholder="Nome da rua ou avenida"
                          className="simple-input"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FaHashtag className="input-label-icon" /> Número
                        </label>
                        <input
                          type="text"
                          value={localizacao.numero}
                          onChange={(e) => handleLocalizacaoChange('numero', e.target.value)}
                          placeholder="Número do local"
                          className="simple-input"
                          required
                        />
                      </div>

                      <div className="input-group">
                        <label className="input-label">
                          <FaMapPin className="input-label-icon" /> Bairro
                        </label>
                        <input
                          type="text"
                          value={localizacao.bairro}
                          onChange={(e) => handleLocalizacaoChange('bairro', e.target.value)}
                          placeholder="Bairro do local"
                          className="simple-input"
                          required
                        />
                      </div>

                      <div className="input-group full-width">
                        <label className="input-label">
                          Complemento (opcional)
                        </label>
                        <input
                          type="text"
                          value={localizacao.complemento}
                          onChange={(e) => handleLocalizacaoChange('complemento', e.target.value)}
                          placeholder="Ex: Sala 203, Bloco B, Andar 2"
                          className="simple-input"
                        />
                      </div>
                    </div>
                    
                    <small className="input-hint">
                      Certifique-se de que o local seja adequado para aulas de música
                    </small>
                  </div>
                )}

                {/* Condicional: Domicílio */}
                {tipoAula === 'domicilio' && (
                  <div className="conditional-section">
                    <div className="conditional-header">
                      <div className="conditional-icon-wrapper">
                        <FaHome className="conditional-icon" />
                      </div>
                      <div>
                        <h3 className="conditional-title">Aulas no Domicílio</h3>
                        <p className="conditional-description">
                          Você irá até a residência do aluno para ministrar as aulas
                        </p>
                      </div>
                    </div>
                    <div className="info-card">
                      <FaInfoCircle className="info-card-icon" />
                      <div className="info-card-content">
                        <h4 className="info-card-title">Informação Importante</h4>
                        <p className="info-card-text">
                          As aulas serão agendadas considerando o deslocamento até o 
                          domicílio do aluno. Certifique-se de definir uma área de 
                          atendimento na sua agenda e considerar o tempo de deslocamento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botão de Salvar */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <FaSave className="save-button-icon" />
                      Salvar Configurações
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Informações Adicionais */}
            <div className="info-card-sidebar">
              <div className="info-card-header">
                <FaInfoCircle className="info-card-header-icon" />
                <h3 className="info-card-title">Informações Importantes</h3>
              </div>
              
              <div className="info-list">
                <div className="info-item">
                  <div className="info-item-bullet"></div>
                  <div className="info-item-content">
                    <span className="info-item-title">Valor da hora:</span>
                    <span className="info-item-text">Pode ser ajustado a qualquer momento</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-bullet"></div>
                  <div className="info-item-content">
                    <span className="info-item-title">Tipo de aula:</span>
                    <span className="info-item-text">Você pode oferecer múltiplas modalidades</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-bullet"></div>
                  <div className="info-item-content">
                    <span className="info-item-title">Google Meet:</span>
                    <span className="info-item-text">Gere um link fixo para todas as suas aulas</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-bullet"></div>
                  <div className="info-item-content">
                    <span className="info-item-title">Localização:</span>
                    <span className="info-item-text">Inclua detalhes como estacionamento e acessibilidade</span>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-bullet"></div>
                  <div className="info-item-content">
                    <span className="info-item-title">Domicílio:</span>
                    <span className="info-item-text">Considere o tempo de deslocamento no seu planejamento</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatButton />
      <Footer />
    </>
  )
}

export default DashProfessor