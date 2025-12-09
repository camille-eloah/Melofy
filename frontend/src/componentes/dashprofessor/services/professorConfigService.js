/**
 * Serviço para gerenciar chamadas à API de configurações de professor
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const professorConfigService = {
  /**
   * Salva as configurações do professor
   */
  async saveConfig(configData) {
    try {
      const response = await fetch(`${API_BASE_URL}/professor/configuracoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(configData)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  },

  /**
   * Obtém as configurações atuais do professor
   */
  async getConfig() {
    try {
      const response = await fetch(`${API_BASE_URL}/professor/configuracoes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Erro ao obter configurações')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }
}
