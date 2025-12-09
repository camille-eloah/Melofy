/**
 * Serviço para lógicas de Tipo de Aula
 * Valida dados, formata, e processa informações relacionadas à modalidade
 */

export const tipoAulaService = {
  /**
   * Lista com tipos de aula disponíveis
   */
  getTiposAula() {
    return [
      {
        id: 'domicilio',
        label: 'Aula Domiciliar',
        icon: 'FaHome',
        description: 'Você vai até o aluno'
      },
      {
        id: 'presencial',
        label: 'Aula Presencial',
        icon: 'FaBuilding',
        description: 'Aula em local específico'
      },
      {
        id: 'remota',
        label: 'Aula Remota',
        icon: 'FaVideo',
        description: 'Aula via Google Meet'
      }
    ]
  },

  /**
   * Valida se o tipo de aula é válido
   */
  isTipoAulaValid(tipoAula) {
    const tipos = this.getTiposAula()
    return tipos.some(t => t.id === tipoAula)
  },

  /**
   * Valida requisitos específicos do tipo de aula
   */
  validateTipoAulaRequirements(tipoAula, linkGoogleMeet, localizacao) {
    const errors = []

    if (tipoAula === 'remota') {
      if (!linkGoogleMeet || linkGoogleMeet.trim() === '') {
        errors.push('Link do Google Meet é obrigatório para aulas remotas')
      } else if (!this.isValidGoogleMeetLink(linkGoogleMeet)) {
        errors.push('Link do Google Meet inválido. Deve começar com https://meet.google.com/')
      }
    }

    if (tipoAula === 'presencial') {
      const requiredFields = ['cidade', 'estado', 'rua', 'numero', 'bairro']
      const missingFields = requiredFields.filter(field => !localizacao[field] || localizacao[field].trim() === '')
      
      if (missingFields.length > 0) {
        errors.push(`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Valida se é um link válido do Google Meet
   */
  isValidGoogleMeetLink(link) {
    try {
      const url = new URL(link)
      return url.hostname === 'meet.google.com' || url.hostname === 'www.meet.google.com'
    } catch {
      return false
    }
  },

  /**
   * Formata os dados de tipo de aula para enviar à API
   */
  formatTipoAulaData(tipoAula, linkGoogleMeet, localizacao) {
    return {
      tipo_aula: tipoAula,
      link_meet: tipoAula === 'remota' ? linkGoogleMeet : null,
      localizacao: tipoAula === 'presencial' ? localizacao : null
    }
  },

  /**
   * Obtém a label de um tipo de aula pelo ID
   */
  getTipoAulaLabel(tipoAulaId) {
    const tipo = this.getTiposAula().find(t => t.id === tipoAulaId)
    return tipo ? tipo.label : 'Desconhecido'
  },

  /**
   * Verifica qual tipo de aula requer informações adicionais
   */
  requiresAdditionalInfo(tipoAula) {
    return ['remota', 'presencial'].includes(tipoAula)
  }
}
