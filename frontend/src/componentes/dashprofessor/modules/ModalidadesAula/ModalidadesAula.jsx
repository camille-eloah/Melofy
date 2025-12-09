import React from 'react'
import {
  FaChalkboardTeacher,
  FaHome,
  FaBuilding,
  FaVideo,
  FaLink,
  FaMapMarkerAlt,
  FaCity,
  FaMapPin,
  FaRoad,
  FaHashtag,
  FaMapMarkedAlt,
  FaMoneyBillWave,
  FaMap,
  FaInfoCircle
} from 'react-icons/fa'
import './ModalidadesAula.css'

/**
 * Componente ModalidadesAula
 * Gerencia a seção de modalidades de aula no Dashboard do Professor
 * 
 * @param {Object} props
 * @param {Array} props.tiposAulaSelecionados - Array com os IDs dos tipos de aula selecionados
 * @param {Function} props.toggleTipoAula - Função para alternar seleção de um tipo de aula
 * @param {Object} props.statusModalidades - Objeto com status ativo/inativo de cada modalidade
 * @param {Function} props.toggleStatusModalidade - Função para alternar status de uma modalidade
 * @param {Function} props.isModalidadeConfigured - Função que verifica se uma modalidade está configurada
 * @param {string} props.linkGoogleMeet - Link do Google Meet para aulas remotas
 * @param {Function} props.setLinkGoogleMeet - Função para atualizar o link do Google Meet
 * @param {Object} props.localizacao - Objeto com dados de localização para aula presencial
 * @param {Function} props.handleLocalizacaoChange - Função para atualizar campos de localização
 * @param {string} props.raioAtendimento - Raio de atendimento em km para aulas domiciliares
 * @param {Function} props.setRaioAtendimento - Função para atualizar raio de atendimento
 * @param {string} props.taxaPorKm - Taxa cobrada por km de deslocamento
 * @param {Function} props.setTaxaPorKm - Função para atualizar taxa por km
 */
function ModalidadesAula({
  tiposAulaSelecionados,
  toggleTipoAula,
  statusModalidades,
  toggleStatusModalidade,
  isModalidadeConfigured,
  linkGoogleMeet,
  setLinkGoogleMeet,
  localizacao,
  handleLocalizacaoChange,
  raioAtendimento,
  setRaioAtendimento,
  taxaPorKm,
  setTaxaPorKm
}) {
  const tiposAula = [
    { id: 'domicilio', label: 'Aula Domiciliar', icon: <FaHome /> },
    { id: 'presencial', label: 'Aula Presencial', icon: <FaBuilding /> },
    { id: 'remota', label: 'Aula Remota', icon: <FaVideo /> }
  ]

  return (
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

      {/* Seção Condicional: Aula Remota */}
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

      {/* Seção Condicional: Aula Presencial */}
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

      {/* Seção Condicional: Aula Domiciliar */}
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
  )
}

export default ModalidadesAula
