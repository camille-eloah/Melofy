import { useEffect } from 'react'
import './DashProfessor.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'
import { useDashProfessor } from './hooks/useDashProfessor'
import ModalidadesAula from './modules/ModalidadesAula/ModalidadesAula'
import HorariosDisponiveis from './modules/HorariosDisponiveis/HorariosDisponiveis'
import { 
  FaMoneyBillWave, 
  FaHome,
  FaSave,
  FaInfoCircle,
  FaBuilding,
  FaCalendarAlt,
  FaCheck,
  FaTimes,
  FaUser,
  FaMusic,
  FaCalendarCheck,
  FaCommentDots,
  FaMoneyBill,
  FaFilter,
  FaSync,
  FaVideo,
  FaMapMarkerAlt
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
    setTaxaPorKm,
    solicitacoes,
    loadingSolicitacoes,
    filtroStatus,
    setFiltroStatus,
    carregarSolicitacoes,
    aceitarSolicitacao,
    recusarSolicitacao,
    cancelarSolicitacao,
    solicitacoesFiltradas
  } = useDashProfessor()

  useEffect(() => {
    carregarConfiguracoes()
    carregarSolicitacoes()
  }, [carregarConfiguracoes, carregarSolicitacoes])

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

              <HorariosDisponiveis
                horariosDisponiveis={horariosDisponiveis}
                toggleDiaSemana={toggleDiaSemana}
                toggleHorario={toggleHorario}
                diasSemana={diasSemana}
                horariosDoDia={horariosDoDia}
              />

              <ModalidadesAula
                tiposAulaSelecionados={tiposAulaSelecionados}
                toggleTipoAula={toggleTipoAula}
                statusModalidades={statusModalidades}
                toggleStatusModalidade={toggleStatusModalidade}
                isModalidadeConfigured={isModalidadeConfigured}
                linkGoogleMeet={linkGoogleMeet}
                setLinkGoogleMeet={setLinkGoogleMeet}
                localizacao={localizacao}
                handleLocalizacaoChange={handleLocalizacaoChange}
                raioAtendimento={raioAtendimento}
                setRaioAtendimento={setRaioAtendimento}
                taxaPorKm={taxaPorKm}
                setTaxaPorKm={setTaxaPorKm}
              />

              <div className="config-section">
                <div className="section-header">
                  <div className="section-icon-wrapper">
                    <FaCalendarCheck className="section-icon" />
                  </div>
                  <div className="section-title-wrapper">
                    <h2 className="section-title">Solicitações de Aula</h2>
                    <p className="section-description">
                      Gerencie as solicitações de aula recebidas dos alunos
                    </p>
                  </div>
                </div>

                <div className="filtros-solicitacoes">
                  <div className="filtros-header">
                    <FaFilter className="filtro-icon" />
                    <span className="filtro-label">Filtrar por status:</span>
                  </div>
                  <div className="filtros-buttons">
                    <button
                      type="button"
                      className={`filtro-button ${filtroStatus === 'todas' ? 'active' : ''}`}
                      onClick={() => setFiltroStatus('todas')}
                    >
                      Todas ({solicitacoes.length})
                    </button>
                    <button
                      type="button"
                      className={`filtro-button ${filtroStatus === 'pendente' ? 'active' : ''}`}
                      onClick={() => setFiltroStatus('pendente')}
                    >
                      Pendentes ({solicitacoes.filter(s => s.status === 'pendente').length})
                    </button>
                    <button
                      type="button"
                      className={`filtro-button ${filtroStatus === 'confirmada' ? 'active' : ''}`}
                      onClick={() => setFiltroStatus('confirmada')}
                    >
                      Confirmadas ({solicitacoes.filter(s => s.status === 'confirmada').length})
                    </button>
                    <button
                      type="button"
                      className={`filtro-button ${filtroStatus === 'recusada' ? 'active' : ''}`}
                      onClick={() => setFiltroStatus('recusada')}
                    >
                      Recusadas ({solicitacoes.filter(s => s.status === 'recusada').length})
                    </button>
                    <button
                      type="button"
                      className={`filtro-button ${filtroStatus === 'cancelada' ? 'active' : ''}`}
                      onClick={() => setFiltroStatus('cancelada')}
                    >
                      Canceladas ({solicitacoes.filter(s => s.status === 'cancelada').length})
                    </button>
                  </div>
                  <button
                    type="button"
                    className="refresh-button"
                    onClick={carregarSolicitacoes}
                    disabled={loadingSolicitacoes}
                  >
                    <FaSync className={`refresh-icon ${loadingSolicitacoes ? 'spin' : ''}`} />
                    Atualizar
                  </button>
                </div>

                <div className="solicitacoes-container">
                  {loadingSolicitacoes ? (
                    <div className="loading-solicitacoes">
                      <div className="loading-spinner"></div>
                      <p>Carregando solicitações...</p>
                    </div>
                  ) : solicitacoesFiltradas.length === 0 ? (
                    <div className="empty-solicitacoes">
                      <FaCalendarCheck className="empty-icon" />
                      <p className="empty-title">Nenhuma solicitação encontrada</p>
                      <p className="empty-subtitle">
                        {filtroStatus === 'todas' 
                          ? 'Você não possui solicitações de aula no momento.'
                          : `Não há solicitações com status "${filtroStatus}".`}
                      </p>
                    </div>
                  ) : (
                    <div className="solicitacoes-grid">
                      {solicitacoesFiltradas.map((solicitacao) => (
                        <div 
                          key={solicitacao.id} 
                          className={`solicitacao-card ${solicitacao.status}`}
                        >
                          <div className="solicitacao-header">
                            <div className="aluno-info">
                              <img 
                                src={solicitacao.aluno.foto} 
                                alt={solicitacao.aluno.nome}
                                className="aluno-foto"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/100';
                                  e.target.onerror = null;
                                }}
                              />
                              <div className="aluno-detalhes">
                                <h3 className="aluno-nome">{solicitacao.aluno.nome}</h3>
                                <div className="aluno-metadata">
                                  <span className="metadata-item">
                                    <FaUser className="metadata-icon" />
                                    {solicitacao.aluno.nivel}
                                  </span>
                                  <span className="metadata-item">
                                    <FaMusic className="metadata-icon" />
                                    {solicitacao.aluno.instrumento}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="solicitacao-status">
                              <span className={`status-badge ${solicitacao.status}`}>
                                {solicitacao.status === 'pendente' && '⏳ Pendente'}
                                {solicitacao.status === 'confirmada' && '✅ Confirmada'}
                                {solicitacao.status === 'recusada' && '❌ Recusada'}
                                {solicitacao.status === 'cancelada' && '🚫 Cancelada'}
                              </span>
                              <span className="data-solicitacao">
                                {new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          <div className="solicitacao-body">
                            <div className="solicitacao-detalhes">
                              <div className="detalhe-item">
                                <FaMapMarkerAlt className="detalhe-icon" />
                                <div>
                                  <span className="detalhe-label">Modalidade:</span>
                                  <span className="detalhe-value">
                                    {solicitacao.modalidade === 'presencial' && '📍 Presencial'}
                                    {solicitacao.modalidade === 'remota' && '🎥 Online'}
                                    {solicitacao.modalidade === 'domicilio' && '🏠 Domicílio'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="detalhe-item">
                                <FaCalendarCheck className="detalhe-icon" />
                                <div>
                                  <span className="detalhe-label">Horários solicitados:</span>
                                  <span className="detalhe-value">
                                    {solicitacao.horariosSolicitados.join(', ')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="detalhe-item">
                                <FaMoneyBill className="detalhe-icon" />
                                <div>
                                  <span className="detalhe-label">Pacote/Valor:</span>
                                  <span className="detalhe-value">
                                    {solicitacao.pacote} - R$ {solicitacao.valor.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {solicitacao.observacao && (
                              <div className="observacao-container">
                                <FaCommentDots className="observacao-icon" />
                                <div className="observacao-content">
                                  <span className="observacao-label">Observação do aluno:</span>
                                  <p className="observacao-text">{solicitacao.observacao}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="solicitacao-actions">
                            {solicitacao.status === 'pendente' ? (
                              <>
                                <button
                                  type="button"
                                  className="action-button accept-button"
                                  onClick={() => aceitarSolicitacao(solicitacao.id)}
                                >
                                  <FaCheck className="action-icon" />
                                  Aceitar Solicitação
                                </button>
                                <button
                                  type="button"
                                  className="action-button reject-button"
                                  onClick={() => recusarSolicitacao(solicitacao.id)}
                                >
                                  <FaTimes className="action-icon" />
                                  Recusar
                                </button>
                              </>
                            ) : solicitacao.status === 'confirmada' ? (
                              <button
                                type="button"
                                className="action-button cancel-button"
                                onClick={() => cancelarSolicitacao(solicitacao.id)}
                              >
                                <FaTimes className="action-icon" />
                                Cancelar Aula
                              </button>
                            ) : (
                              <div className="actions-disabled">
                                <span className="actions-message">
                                  {solicitacao.status === 'recusada' 
                                    ? 'Solicitação recusada' 
                                    : 'Solicitação cancelada'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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