import { useEffect } from 'react'
import './DashProfessor.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'
import { useDashProfessor } from './hooks/useDashProfessor'
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
  FaLink,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaClock,
  FaMap
} from 'react-icons/fa'

function DashProfessor() {
  const {
    valorHora,
    setValorHora,
    tiposAulaSelecionados,
    toggleTipoAula,
    toggleStatusModalidade,
    statusModalidades,
    linkGoogleMeet,
    setLinkGoogleMeet,
    localizacao,
    handleLocalizacaoChange,
    isSaving,
    carregarConfiguracoes,
    handleSave,
    configsSalvas,
    raioAtendimento,
    setRaioAtendimento,
    horariosDisponiveis,
    toggleDiaSemana,
    toggleHorario,
    diasSemana,
    horariosDoDia,
    taxaPorKm,
    setTaxaPorKm
  } = useDashProfessor()

  useEffect(() => {
    carregarConfiguracoes()
  }, [carregarConfiguracoes])

  const tiposAula = [
    { id: 'domicilio', label: 'Aula Domiciliar', icon: <FaHome /> },
    { id: 'presencial', label: 'Aula Presencial', icon: <FaBuilding /> },
    { id: 'remota', label: 'Aula Remota', icon: <FaVideo /> }
  ]

  const isModalidadeConfigured = (tipoAulaId) => {
    if (!configsSalvas) return false
    if (tipoAulaId === 'remota') return !!configsSalvas.config_remota
    if (tipoAulaId === 'presencial') return !!configsSalvas.config_presencial
    if (tipoAulaId === 'domicilio') return !!configsSalvas.config_domicilio
    return false
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSave()
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-wrapper">
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

              <div className="config-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <FaCalendarAlt className="section-icon" />
                  </div>
                  <div className="section-title-wrapper">
                    <h2 className="section-title">Horários Disponíveis</h2>
                    <p className="section-description">
                      Selecione os dias da semana e horários em que você está disponível para ministrar aulas
                    </p>
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">
                    Dias da semana disponíveis
                  </label>
                  <div className="dias-semana-grid">
                    {diasSemana.map((dia) => (
                      <div key={dia.id} className="dia-semana-wrapper">
                        <input
                          type="checkbox"
                          id={`dia-${dia.id}`}
                          checked={horariosDisponiveis[dia.id]?.selecionado || false}
                          onChange={() => toggleDiaSemana(dia.id)}
                          className="checkbox-input-hidden"
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor={`dia-${dia.id}`}
                          className={`dia-semana-option ${horariosDisponiveis[dia.id]?.selecionado ? 'selected' : ''}`}
                        >
                          <span className="dia-label">{dia.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="horarios-container">
                  {Object.entries(horariosDisponiveis).filter(([_, data]) => data.selecionado).map(([diaId, data]) => (
                    <div key={diaId} className="horarios-dia-section">
                      <h3 className="horarios-dia-title">
                        Horários para {diasSemana.find(d => d.id === diaId)?.label}
                      </h3>
                      <div className="horarios-grid">
                        {horariosDoDia.map((horario) => (
                          <div key={`${diaId}-${horario}`} className="horario-wrapper">
                            <input
                              type="checkbox"
                              id={`horario-${diaId}-${horario}`}
                              checked={data.horarios.includes(horario)}
                              onChange={() => toggleHorario(diaId, horario)}
                              className="checkbox-input-hidden"
                              style={{ display: 'none' }}
                            />
                            <label 
                              htmlFor={`horario-${diaId}-${horario}`}
                              className={`horario-option ${data.horarios.includes(horario) ? 'selected' : ''}`}
                            >
                              {horario}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="config-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <FaChalkboardTeacher className="section-icon" />
                  </div>
                  <div className="section-title-wrapper">
                    <h2 className="section-title">Modalidades de Aula</h2>
                    <p className="section-description">
                      Selecione quantas modalidades desejar - você pode oferecer múltiplas opções
                    </p>
                  </div>
                </div>
                
                <div className="input-group">
                  <label className="input-label">
                    Selecione as modalidades disponíveis
                  </label>
                  <div className="tipo-aula-grid">
                    {tiposAula.map((tipo) => (
                      <div key={tipo.id} className="modal-item-wrapper">
                        <input
                          type="checkbox"
                          id={`modal-${tipo.id}`}
                          checked={tiposAulaSelecionados.includes(tipo.id)}
                          onChange={() => toggleTipoAula(tipo.id)}
                          className="checkbox-input-hidden"
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor={`modal-${tipo.id}`}
                          className={`tipo-aula-option-card ${tiposAulaSelecionados.includes(tipo.id) ? 'selected' : ''}`}
                        >
                          <div className="option-content-wrapper">
                            <div className="option-icon-wrapper">
                              {tipo.icon}
                              {isModalidadeConfigured(tipo.id) && (
                                <span className="configured-badge" title="Modalidade configurada">✓</span>
                              )}
                            </div>
                            <span className="option-label">{tipo.label}</span>
                            <div 
                              className="toggle-switch"
                              onClick={(e) => {
                                if (tiposAulaSelecionados.includes(tipo.id)) {
                                  toggleStatusModalidade(tipo.id, e)
                                }
                              }}
                            >
                              <div className={`switch-track ${statusModalidades[tipo.id] ? 'active' : ''}`}>
                                <div className="switch-thumb"></div>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {tiposAulaSelecionados.includes('remota') && (
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
                          required={tiposAulaSelecionados.includes('remota')}
                        />
                      </div>
                      <small className="input-hint">
                        Este link será compartilhado com seus alunos antes das aulas
                      </small>
                    </div>
                  </div>
                )}

                {tiposAulaSelecionados.includes('presencial') && (
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
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().slice(0, 2)
                            handleLocalizacaoChange('estado', value)
                          }}
                          placeholder="Ex: SP, RJ, MG"
                          className="simple-input"
                          maxLength={2}
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

                {tiposAulaSelecionados.includes('domicilio') && (
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
                    
                    <div className="input-group">
                      <label className="input-label">
                        <FaMapMarkedAlt className="input-label-icon" /> Raio de Atendimento (km)
                      </label>
                      <div className="raio-input-wrapper">
                        <input
                          type="number"
                          value={raioAtendimento}
                          onChange={(e) => setRaioAtendimento(e.target.value)}
                          placeholder="5"
                          min="1"
                          max="100"
                          step="1"
                          className="simple-input"
                        />
                        <span className="input-suffix">km</span>
                      </div>
                      <small className="input-hint">
                        Distância máxima que você está disposto a percorrer para atender alunos
                      </small>
                    </div>

                    <div className="input-group">
                      <label className="input-label">
                        <FaMoneyBillWave className="input-label-icon" /> Taxa por km de deslocamento (R$)
                      </label>
                      <div className="valor-input-wrapper">
                        <span className="input-prefix">R$</span>
                        <input
                          type="number"
                          value={taxaPorKm}
                          onChange={(e) => setTaxaPorKm(e.target.value)}
                          placeholder="2,50"
                          min="0"
                          step="0.01"
                          className="simple-input"
                        />
                      </div>
                      <small className="input-hint">
                        Valor cobrado por cada quilômetro de deslocamento até o aluno
                      </small>
                    </div>

                    <div className="mapa-container">
                      <div className="conditional-header">
                        <div className="conditional-icon-wrapper">
                          <FaMap className="conditional-icon" />
                        </div>
                        <div>
                          <h3 className="conditional-title">Localização para Atendimento</h3>
                          <p className="conditional-description">
                            Mapa para visualização da sua área de atendimento (será implementado posteriormente)
                          </p>
                        </div>
                      </div>
                      <div className="mapa-placeholder">
                        <div className="mapa-content">
                          <FaMap className="mapa-icon" />
                          <p className="mapa-text">Espaço reservado para implementação do mapa</p>
                          <p className="mapa-subtext">
                            Aqui será exibido um mapa com sua localização e raio de atendimento
                          </p>
                        </div>
                      </div>
                      <small className="input-hint">
                        O mapa será implementado em uma futura atualização do sistema
                      </small>
                    </div>
                    
                    <div className="info-card">
                      <FaInfoCircle className="info-card-icon" />
                      <div className="info-card-content">
                        <h4 className="info-card-title">Informação Importante</h4>
                        <p className="info-card-text">
                          As aulas serão agendadas considerando o deslocamento até o 
                          domicílio do aluno. O sistema mostrará apenas alunos dentro do raio 
                          de {raioAtendimento}km da sua localização. Será adicionada uma taxa de R${taxaPorKm || '0,00'} por km.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? (
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
                    <span className="info-item-title">Horários:</span>
                    <span className="info-item-text">Selecione seus horários disponíveis para cada dia</span>
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

                {configsSalvas && (isModalidadeConfigured('remota') || isModalidadeConfigured('presencial') || isModalidadeConfigured('domicilio')) && (
                  <div className="info-item-section">
                    <span className="info-item-title">Modalidades Configuradas:</span>
                    <div className="config-badges-container">
                      {isModalidadeConfigured('remota') && (
                        <span className="config-badge" title="Aula Remota configurada">🎥 Remota</span>
                      )}
                      {isModalidadeConfigured('presencial') && (
                        <span className="config-badge" title="Aula Presencial configurada">📍 Presencial</span>
                      )}
                      {isModalidadeConfigured('domicilio') && (
                        <span className="config-badge" title="Aula Domiciliar configurada">🏠 Domicílio</span>
                      )}
                    </div>
                  </div>
                )}
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