import { useEffect } from 'react'
import './DashProfessor.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'
import { useDashProfessor } from './hooks/useDashProfessor'
import ModalidadesAula from './modules/ModalidadesAula/ModalidadesAula'
import HorariosDisponiveis from './modules/HorariosDisponiveis/HorariosDisponiveis'
import SolicitacoesAula from './modules/SolicitacoesAula/SolicitacoesAula'
import { 
  FaMoneyBillWave, 
  FaSave,
  FaInfoCircle,
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaPlus
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
    solicitacoesFiltradas,
    pacotes,
    isLoadingPacotes,
    carregarPacotes,
    handleDeletePackage,
    handleEditPackage,
    handleCreatePackage
  } = useDashProfessor()

  useEffect(() => {
    carregarConfiguracoes()
    carregarSolicitacoes()
    carregarPacotes()
  }, [carregarConfiguracoes, carregarSolicitacoes, carregarPacotes])

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

              <SolicitacoesAula
                solicitacoes={solicitacoes}
                loadingSolicitacoes={loadingSolicitacoes}
                filtroStatus={filtroStatus}
                setFiltroStatus={setFiltroStatus}
                carregarSolicitacoes={carregarSolicitacoes}
                aceitarSolicitacao={aceitarSolicitacao}
                recusarSolicitacao={recusarSolicitacao}
                cancelarSolicitacao={cancelarSolicitacao}
                solicitacoesFiltradas={solicitacoesFiltradas}
              />

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

        {/* Seção de Pacotes de Aulas */}
        <div className="config-section">
          <div className="config-section-header">
            <FaBoxOpen className="section-icon" />
            <h2>Pacotes de Aulas</h2>
            <button 
              className="btn-criar-pacote" 
              onClick={handleCreatePackage}
              title="Criar novo pacote"
            >
              <FaPlus /> Criar Pacote
            </button>
          </div>

          <div className="config-section-content">
            {isLoadingPacotes ? (
              <div className="loading-pacotes">
                <p>Carregando pacotes...</p>
              </div>
            ) : pacotes.length === 0 ? (
              <div className="sem-pacotes">
                <p>Você ainda não criou nenhum pacote de aulas.</p>
                <p>Crie pacotes com diferentes quantidades de aulas e valores especiais!</p>
              </div>
            ) : (
              <div className="pacotes-grid">
                {pacotes.map((pac) => {
                  const valorPorAula = (pac.pac_valor_total / pac.pac_quantidade_aulas).toFixed(2)
                  return (
                    <div key={pac.pac_id} className="pacote-card">
                      <div className="pacote-header">
                        <h3>{pac.pac_nome}</h3>
                        <div className="pacote-actions">
                          <button 
                            className="btn-action btn-edit" 
                            onClick={() => handleEditPackage(pac)}
                            title="Editar pacote"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-action btn-delete" 
                            onClick={() => handleDeletePackage(pac)}
                            title="Deletar pacote"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="pacote-info">
                        <div className="info-row">
                          <span className="info-label">Quantidade de Aulas:</span>
                          <span className="info-value">{pac.pac_quantidade_aulas} aulas</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Valor Total:</span>
                          <span className="info-value destaque">R$ {Number.parseFloat(pac.pac_valor_total).toFixed(2)}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Valor por Aula:</span>
                          <span className="info-value">R$ {valorPorAula}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <ChatButton />
      <Footer />
    </>
  )
}

export default DashProfessor