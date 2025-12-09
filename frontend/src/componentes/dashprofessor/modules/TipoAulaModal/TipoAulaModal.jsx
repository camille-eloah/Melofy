/**
 * Componente TipoAulaModal
 * Encapsula a seleção de tipo de aula e suas informações adicionais
 */

import React from 'react'
import {
  FaHome,
  FaBuilding,
  FaVideo,
  FaMapMarkerAlt,
  FaLink,
  FaInfoCircle,
  FaCity,
  FaMapPin,
  FaRoad,
  FaHashtag
} from 'react-icons/fa'
import { useTipoAula } from './useTipoAula'
import { tipoAulaService } from './tipoAulaService'
import './TipoAulaModal.css'

const iconMap = {
  FaHome: <FaHome />,
  FaBuilding: <FaBuilding />,
  FaVideo: <FaVideo />
}

function TipoAulaModal({
  tipoAula,
  setTipoAula,
  linkGoogleMeet,
  setLinkGoogleMeet,
  localizacao,
  handleLocalizacaoChange
}) {
  const tipoAulaHook = useTipoAula(tipoAula, setTipoAula, linkGoogleMeet, localizacao)
  const tiposAula = tipoAulaHook.getTiposAula()

  return (
    <div className="tipo-aula-modal">
      {/* Header */}
      <div className="tipo-aula-header">
        <div className="tipo-aula-icon-wrapper">
          <FaMapMarkerAlt className="tipo-aula-section-icon" />
        </div>
        <div className="tipo-aula-title-wrapper">
          <h2 className="tipo-aula-section-title">Modalidade de Aula</h2>
          <p className="tipo-aula-section-description">
            Selecione como você prefere ministrar suas aulas
          </p>
        </div>
      </div>

      {/* Grid de Seleção */}
      <div className="tipo-aula-input-group">
        <label className="tipo-aula-input-label">
          Selecione o tipo de aula
        </label>
        <div className="tipo-aula-grid">
          {tiposAula.map((tipo) => (
            <div
              key={tipo.id}
              className={`tipo-aula-option ${tipoAula === tipo.id ? 'selected' : ''}`}
              onClick={() => tipoAulaHook.handleTipoAulaChange(tipo.id)}
            >
              <div className="tipo-aula-option-icon-wrapper">
                {iconMap[tipo.icon]}
              </div>
              <span className="tipo-aula-option-label">{tipo.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seção Condicional: Google Meet */}
      {tipoAula === 'remota' && (
        <div className="tipo-aula-conditional-section">
          <div className="tipo-aula-conditional-header">
            <div className="tipo-aula-conditional-icon-wrapper">
              <FaVideo className="tipo-aula-conditional-icon" />
            </div>
            <div>
              <h3 className="tipo-aula-conditional-title">Link da Sala Virtual</h3>
              <p className="tipo-aula-conditional-description">
                Insira o link do Google Meet para suas aulas remotas
              </p>
            </div>
          </div>
          <div className="tipo-aula-input-group">
            <div className="tipo-aula-link-input-wrapper">
              <FaLink className="tipo-aula-input-icon" />
              <input
                type="url"
                value={linkGoogleMeet}
                onChange={(e) => setLinkGoogleMeet(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="tipo-aula-simple-input"
              />
            </div>
            <small className="tipo-aula-input-hint">
              Este link será compartilhado com seus alunos antes das aulas
            </small>
          </div>
        </div>
      )}

      {/* Seção Condicional: Localização */}
      {tipoAula === 'presencial' && (
        <div className="tipo-aula-conditional-section">
          <div className="tipo-aula-conditional-header">
            <div className="tipo-aula-conditional-icon-wrapper">
              <FaMapMarkerAlt className="tipo-aula-conditional-icon" />
            </div>
            <div>
              <h3 className="tipo-aula-conditional-title">Local da Aula</h3>
              <p className="tipo-aula-conditional-description">
                Informe onde serão realizadas as aulas presenciais
              </p>
            </div>
          </div>

          <div className="tipo-aula-localizacao-grid">
            <div className="tipo-aula-input-group">
              <label className="tipo-aula-input-label">
                <FaCity className="tipo-aula-input-label-icon" /> Cidade
              </label>
              <input
                type="text"
                value={localizacao.cidade}
                onChange={(e) => handleLocalizacaoChange('cidade', e.target.value)}
                placeholder="Digite a cidade"
                className="tipo-aula-simple-input"
              />
            </div>

            <div className="tipo-aula-input-group">
              <label className="tipo-aula-input-label">
                <FaMapPin className="tipo-aula-input-label-icon" /> Estado
              </label>
              <input
                type="text"
                value={localizacao.estado}
                onChange={(e) => handleLocalizacaoChange('estado', e.target.value)}
                placeholder="Ex: SP, RJ, MG"
                className="tipo-aula-simple-input"
              />
            </div>

            <div className="tipo-aula-input-group">
              <label className="tipo-aula-input-label">
                <FaRoad className="tipo-aula-input-label-icon" /> Rua/Avenida
              </label>
              <input
                type="text"
                value={localizacao.rua}
                onChange={(e) => handleLocalizacaoChange('rua', e.target.value)}
                placeholder="Nome da rua ou avenida"
                className="tipo-aula-simple-input"
              />
            </div>

            <div className="tipo-aula-input-group">
              <label className="tipo-aula-input-label">
                <FaHashtag className="tipo-aula-input-label-icon" /> Número
              </label>
              <input
                type="text"
                value={localizacao.numero}
                onChange={(e) => handleLocalizacaoChange('numero', e.target.value)}
                placeholder="Número do local"
                className="tipo-aula-simple-input"
              />
            </div>

            <div className="tipo-aula-input-group">
              <label className="tipo-aula-input-label">
                <FaMapPin className="tipo-aula-input-label-icon" /> Bairro
              </label>
              <input
                type="text"
                value={localizacao.bairro}
                onChange={(e) => handleLocalizacaoChange('bairro', e.target.value)}
                placeholder="Bairro do local"
                className="tipo-aula-simple-input"
              />
            </div>

            <div className="tipo-aula-input-group full-width">
              <label className="tipo-aula-input-label">
                Complemento (opcional)
              </label>
              <input
                type="text"
                value={localizacao.complemento}
                onChange={(e) => handleLocalizacaoChange('complemento', e.target.value)}
                placeholder="Ex: Sala 203, Bloco B, Andar 2"
                className="tipo-aula-simple-input"
              />
            </div>
          </div>

          <small className="tipo-aula-input-hint">
            Certifique-se de que o local seja adequado para aulas de música
          </small>
        </div>
      )}

      {/* Seção Condicional: Domicílio */}
      {tipoAula === 'domicilio' && (
        <div className="tipo-aula-conditional-section">
          <div className="tipo-aula-conditional-header">
            <div className="tipo-aula-conditional-icon-wrapper">
              <FaHome className="tipo-aula-conditional-icon" />
            </div>
            <div>
              <h3 className="tipo-aula-conditional-title">Aulas no Domicílio</h3>
              <p className="tipo-aula-conditional-description">
                Você irá até a residência do aluno para ministrar as aulas
              </p>
            </div>
          </div>
          <div className="tipo-aula-info-card">
            <FaInfoCircle className="tipo-aula-info-card-icon" />
            <div className="tipo-aula-info-card-content">
              <h4 className="tipo-aula-info-card-title">Informação Importante</h4>
              <p className="tipo-aula-info-card-text">
                As aulas serão agendadas considerando o deslocamento até o
                domicílio do aluno. Certifique-se de definir uma área de
                atendimento na sua agenda e considerar o tempo de deslocamento.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TipoAulaModal
