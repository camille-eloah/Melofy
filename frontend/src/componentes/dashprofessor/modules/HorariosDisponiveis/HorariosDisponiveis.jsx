import { FaCalendarAlt } from 'react-icons/fa'
import './HorariosDisponiveis.css'

function HorariosDisponiveis({
  horariosDisponiveis,
  toggleDiaSemana,
  toggleHorario,
  diasSemana,
  horariosDoDia
}) {
  return (
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
  )
}

export default HorariosDisponiveis
