/**
 * Serviço para gerenciar chamadas à API de configurações de aula
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const configAulaService = {
  /**
   * Salva as configurações de modalidade de aula do professor
   */
  async salvarConfiguracao(configData) {
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
        const error = await response.json()
        throw new Error(error?.detail || 'Erro ao salvar configurações')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  },

  /**
   * Obtém as configurações atuais do professor
   */
  async obterConfiguracoes() {
    try {
      const response = await fetch(`${API_BASE_URL}/professor/configuracoes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.detail || 'Erro ao obter configurações')
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  },

  /**
   * Deleta a configuração de um tipo específico de aula
   */
  async deletarConfiguracaoTipo(tipoAula) {
    try {
      const response = await fetch(`${API_BASE_URL}/professor/configuracoes/${tipoAula}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok && response.status !== 204) {
        const error = await response.json()
        throw new Error(error?.detail || 'Erro ao deletar configuração')
      }

      return true
    } catch (error) {
      throw error
    }
  },

  /**
   * Formata os dados para enviar ao backend (múltiplos tipos de aula)
   */
  formatarDadosParaAPIMultiplo(tiposAulaSelecionados, valorHora, linkGoogleMeet, localizacao, statusModalidades) {
    const payload = {
      valor_hora_aula: valorHora ? parseFloat(valorHora) : null,
      tipos_aula_selecionados: tiposAulaSelecionados,
      link_meet: tiposAulaSelecionados.includes('remota') ? linkGoogleMeet : null,
      localizacao: tiposAulaSelecionados.includes('presencial') ? {
        cidade: localizacao.cidade,
        estado: localizacao.estado,
        rua: localizacao.rua,
        numero: localizacao.numero,
        bairro: localizacao.bairro,
        complemento: localizacao.complemento || null
      } : null,
      // Status de ativação de cada modalidade
      status_modalidades: {
        remota: statusModalidades.remota,
        presencial: statusModalidades.presencial,
        domicilio: statusModalidades.domicilio
      }
    }

    return payload
  },

  /**
   * Formata os dados para enviar ao backend
   */
  formatarDadosParaAPI(tipoAula, valorHora, linkGoogleMeet, localizacao) {
    const payload = {
      valor_hora_aula: valorHora ? parseFloat(valorHora) : null,
      tipos_aula_principal: tipoAula,
    }

    if (tipoAula === 'remota') {
      payload.link_meet = linkGoogleMeet
    } else if (tipoAula === 'presencial') {
      payload.localizacao = {
        cidade: localizacao.cidade,
        estado: localizacao.estado,
        rua: localizacao.rua,
        numero: localizacao.numero,
        bairro: localizacao.bairro,
        complemento: localizacao.complemento || null
      }
    } else if (tipoAula === 'domicilio') {
      payload.ativo_domicilio = true
    }

    return payload
  }
}
