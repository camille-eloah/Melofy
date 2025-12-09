import { FaBoxOpen, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import './PacotesAula.css'

function PacotesAula({ 
  pacotes, 
  isLoadingPacotes, 
  handleCreatePackage, 
  handleEditPackage, 
  handleDeletePackage 
}) {
  return (
    <div className="config-section">
      <div className="section-header">
        <div className="section-icon-wrapper">
          <FaBoxOpen className="section-icon" />
        </div>
        <div className="section-title-wrapper">
          <h2 className="section-title">Pacotes de Aulas</h2>
          <p className="section-description">
            Crie pacotes com quantidades e valores personalizados
          </p>
        </div>
        <button 
          type="button"
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
                        type="button"
                        className="btn-action btn-edit" 
                        onClick={() => handleEditPackage(pac)}
                        title="Editar pacote"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        type="button"
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
  )
}

export default PacotesAula
