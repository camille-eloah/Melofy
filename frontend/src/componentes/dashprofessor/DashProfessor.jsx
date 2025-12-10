import { useEffect, useState } from 'react'
import './DashProfessor.css'
import Header from "../layout/Header"
import Footer from '../layout/Footer'
import ChatButton from '../layout/ButtonChat'
import { useDashProfessor } from './hooks/useDashProfessor'
import ValoresAula from './modules/ValoresAula/ValoresAula'
import PacotesAula from './modules/PacotesAula/PacotesAula'
import ModalidadesAula from './modules/ModalidadesAula/ModalidadesAula'
import HorariosDisponiveis from './modules/HorariosDisponiveis/HorariosDisponiveis'
import SolicitacoesAula from './modules/SolicitacoesAula/SolicitacoesAula'
import { 
  FaSave,
  FaInfoCircle,
  FaMoneyBillWave,
  FaClock,
  FaChalkboardTeacher,
  FaClipboardList
} from 'react-icons/fa'

function DashProfessor() {
  const [abaAtiva, setAbaAtiva] = useState('precos-pacotes')

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
            {/* Menu de navegação por abas */}
            <div className="dashboard-tabs">
              <button
                className={`tab-button ${abaAtiva === 'precos-pacotes' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('precos-pacotes')}
                type="button"
              >
                <FaMoneyBillWave className="tab-icon" />
                <span>Preços e Pacotes</span>
              </button>
              <button
                className={`tab-button ${abaAtiva === 'horarios' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('horarios')}
                type="button"
              >
                <FaClock className="tab-icon" />
                <span>Horários</span>
              </button>
              <button
                className={`tab-button ${abaAtiva === 'modalidades' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('modalidades')}
                type="button"
              >
                <FaChalkboardTeacher className="tab-icon" />
                <span>Modalidades</span>
              </button>
              <button
                className={`tab-button ${abaAtiva === 'solicitacoes' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('solicitacoes')}
                type="button"
              >
                <FaClipboardList className="tab-icon" />
                <span>Solicitações de Aula</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="config-form">
              {/* Preços e Pacotes */}
              {abaAtiva === 'precos-pacotes' && (
                <>
                  <ValoresAula 
                    valorHora={valorHora}
                    setValorHora={setValorHora}
                  />

                  <PacotesAula
                    pacotes={pacotes}
                    isLoadingPacotes={isLoadingPacotes}
                    handleCreatePackage={handleCreatePackage}
                    handleEditPackage={handleEditPackage}
                    handleDeletePackage={handleDeletePackage}
                  />
                </>
              )}

              {/* Horários */}
              {abaAtiva === 'horarios' && (
                <HorariosDisponiveis
                  horariosDisponiveis={horariosDisponiveis}
                  toggleDiaSemana={toggleDiaSemana}
                  toggleHorario={toggleHorario}
                  diasSemana={diasSemana}
                  horariosDoDia={horariosDoDia}
                />
              )}

              {/* Modalidades */}
              {abaAtiva === 'modalidades' && (
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
              )}

              {/* Solicitações de Aula */}
              {abaAtiva === 'solicitacoes' && (
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
              )}

              {/* Botão de salvar - aparece apenas nas abas de configuração */}
              {(abaAtiva === 'precos-pacotes' || abaAtiva === 'horarios' || abaAtiva === 'modalidades') && (
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
              )}
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