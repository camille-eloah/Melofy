import { FaMoneyBillWave } from 'react-icons/fa'
import './ValoresAula.css'

function ValoresAula({ valorHora, setValorHora }) {
  return (
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
  )
}

export default ValoresAula
