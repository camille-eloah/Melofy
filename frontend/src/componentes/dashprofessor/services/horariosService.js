/**
 * Serviço para gerenciar horários disponíveis do professor
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Mapeamento entre IDs dos dias (frontend) e nomes do backend
const diaParaBackend = {
  'segunda': 'Monday',
  'terca': 'Tuesday',
  'quarta': 'Wednesday',
  'quinta': 'Thursday',
  'sexta': 'Friday',
  'sabado': 'Saturday',
  'domingo': 'Sunday'
}

const diaParaFrontend = {
  'Monday': 'segunda',
  'Tuesday': 'terca',
  'Wednesday': 'quarta',
  'Thursday': 'quinta',
  'Friday': 'sexta',
  'Saturday': 'sabado',
  'Sunday': 'domingo'
}

export const horariosService = {
  /**
   * Carrega os horários disponíveis do professor autenticado
   * @returns {Object} Objeto com horários agrupados por dia
   */
  async carregarHorarios() {
    try {
      const response = await fetch(`${API_BASE_URL}/professor/horarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.detail || 'Erro ao carregar horários')
      }

      const data = await response.json()
      
      // Transforma resposta do backend para formato do frontend
      const horariosFormatados = {
        segunda: { selecionado: false, horarios: [] },
        terca: { selecionado: false, horarios: [] },
        quarta: { selecionado: false, horarios: [] },
        quinta: { selecionado: false, horarios: [] },
        sexta: { selecionado: false, horarios: [] },
        sabado: { selecionado: false, horarios: [] },
        domingo: { selecionado: false, horarios: [] }
      }

      // Processa cada dia retornado pela API
      if (data.horarios_por_dia && Array.isArray(data.horarios_por_dia)) {
        data.horarios_por_dia.forEach(diaData => {
          const diaId = diaParaFrontend[diaData.dia_semana]
          if (diaId && diaData.horarios && diaData.horarios.length > 0) {
            horariosFormatados[diaId] = {
              selecionado: true,
              horarios: diaData.horarios
            }
          }
        })
      }

      return horariosFormatados
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
      throw error
    }
  },

  /**
   * Salva os horários disponíveis do professor
   * @param {Object} horariosDisponiveis - Objeto com horários por dia
   */
  async salvarHorarios(horariosDisponiveis) {
    try {
      console.log('[horariosService] Horários recebidos do frontend:', horariosDisponiveis)
      
      // Transforma dados do frontend para formato do backend
      const horarios = []
      
      Object.entries(horariosDisponiveis).forEach(([diaId, diaData]) => {
        const diaSemana = diaParaBackend[diaId]
        
        // Só inclui dias que têm horários selecionados
        if (diaData.selecionado && diaData.horarios && diaData.horarios.length > 0) {
          diaData.horarios.forEach(horario => {
            horarios.push({
              dia_semana: diaSemana,
              horario: horario
            })
          })
        }
      })

      const payload = { horarios }
      console.log('[horariosService] Payload para enviar ao backend:', payload)
      console.log('[horariosService] Total de horários:', horarios.length)

      const response = await fetch(`${API_BASE_URL}/professor/horarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      console.log('[horariosService] Status da resposta:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[horariosService] Erro detalhado do backend:', errorData)
        
        let errorMessage = 'Erro ao salvar horários'
        
        if (errorData?.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
              const field = err.loc ? err.loc.join('.') : 'campo desconhecido'
              return `${field}: ${err.msg}`
            }).join('\n')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          } else {
            errorMessage = JSON.stringify(errorData.detail)
          }
        }
        
        console.error('[horariosService] Mensagem de erro formatada:', errorMessage)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('[horariosService] Horários salvos com sucesso:', result)
      return result
    } catch (error) {
      console.error('[horariosService] Erro ao salvar horários:', error)
      throw error
    }
  },

  /**
   * Carrega os horários disponíveis de um professor específico (público)
   * @param {number} professorId - ID do professor
   * @returns {Object} Objeto com horários agrupados por dia
   */
  async carregarHorariosProfessor(professorId) {
    try {
      console.log('[horariosService] Carregando horários do professor:', professorId);
      const response = await fetch(`${API_BASE_URL}/professor/${professorId}/horarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[horariosService] Erro na resposta:', error);
        throw new Error(error?.detail || 'Erro ao carregar horários do professor')
      }

      const data = await response.json()
      console.log('[horariosService] Dados recebidos da API:', data);
      
      // Transforma resposta para formato mais simples
      const horariosPorDia = {}
      
      if (data.horarios_por_dia && Array.isArray(data.horarios_por_dia)) {
        data.horarios_por_dia.forEach(diaData => {
          const diaId = diaParaFrontend[diaData.dia_semana]
          console.log('[horariosService] Processando dia:', diaData.dia_semana, '-> frontend:', diaId);
          if (diaId) {
            horariosPorDia[diaId] = diaData.horarios || []
          }
        })
      }

      console.log('[horariosService] Horários formatados:', horariosPorDia);
      return horariosPorDia
    } catch (error) {
      console.error('Erro ao carregar horários do professor:', error)
      throw error
    }
  }
}
