import {
  FaCalendarCheck,
  FaFilter,
  FaSync,
  FaUser,
  FaMusic,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaCommentDots,
  FaCheck,
  FaTimes
} from 'react-icons/fa'
import './SolicitacoesAula.css'

function SolicitacoesAula({
  solicitacoes,
  loadingSolicitacoes,
  filtroStatus,
  setFiltroStatus,
  carregarSolicitacoes,
  aceitarSolicitacao,
  recusarSolicitacao,
  cancelarSolicitacao,
  solicitacoesFiltradas
}) {
  return (
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
  )
}

export default SolicitacoesAula
