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
   * Verifica se uma modalidade está configurada
   */
  isModalidadeConfigured(tipoAula, configs) {
    if (!configs) return false
    
    if (tipoAula === 'remota') {
      return !!configs.config_aula_remota
    } else if (tipoAula === 'presencial') {
      return !!configs.config_aula_presencial
    } else if (tipoAula === 'domicilio') {
      return !!configs.config_aula_domicilio
    }
    return false
  },

  /**
   * Obtém as modalidades já configuradas
   */
  getModalidadesConfiguradas(configs) {
    const modalidades = []
    if (!configs) return modalidades
    
    if (configs.config_aula_remota) modalidades.push('remota')
    if (configs.config_aula_presencial) modalidades.push('presencial')
    if (configs.config_aula_domicilio) modalidades.push('domicilio')
    
    return modalidades
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
  },

  /**
   * Formata dados para persistência no banco
   * @param {string} tipoAula - Tipo de aula selecionado
   * @param {string} valorHora - Valor por hora
   * @param {string} linkGoogleMeet - Link do Google Meet (se remota)
   * @param {object} localizacao - Localização (se presencial)
   * @returns {object} Dados formatados para API
   */
  formatarParaPersistencia(tipoAula, valorHora, linkGoogleMeet, localizacao) {
    const payload = {
      valor_hora_aula: valorHora ? parseFloat(valorHora) : null,
      tipo_aula_principal: tipoAula,
    }

    if (tipoAula === 'remota' && linkGoogleMeet) {
      payload.link_meet = linkGoogleMeet
    } else if (tipoAula === 'presencial' && localizacao) {
      payload.localizacao = {
        cidade: localizacao.cidade.trim(),
        estado: localizacao.estado.trim(),
        rua: localizacao.rua.trim(),
        numero: localizacao.numero.trim(),
        bairro: localizacao.bairro.trim(),
        complemento: localizacao.complemento ? localizacao.complemento.trim() : null
      }
    } else if (tipoAula === 'domicilio') {
      payload.ativo_domicilio = true
    }

    return payload
  },

  /**
   * Valida dados completos antes de enviar
   * @returns {object} { isValid: boolean, errors: string[] }
   */
  validarAntesDeSalvar(tipoAula, valorHora, linkGoogleMeet, localizacao) {
    const errors = []

    // Validar valor da hora
    if (!valorHora || parseFloat(valorHora) <= 0) {
      errors.push('Valor da hora deve ser maior que zero')
    }

    // Validar tipo de aula
    if (!tipoAula || !this.isTipoAulaValid(tipoAula)) {
      errors.push('Tipo de aula inválido')
    }

    // Validar requisitos específicos
    const reqs = this.validateTipoAulaRequirements(tipoAula, linkGoogleMeet, localizacao)
    if (!reqs.isValid) {
      errors.push(...reqs.errors)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Formata dados para envio à API (nova abordagem)
   */
  formatarDadosParaAPI(tipoAula, valorHora, linkGoogleMeet, localizacao) {
    const payload = {
      valor_hora_aula: valorHora ? parseFloat(valorHora) : null,
      tipos_aula_principal: tipoAula,
    }

    if (tipoAula === 'remota' && linkGoogleMeet) {
      payload.link_meet = linkGoogleMeet
    } else if (tipoAula === 'presencial' && localizacao) {
      payload.localizacao = {
        cidade: localizacao.cidade.trim(),
        estado: localizacao.estado.trim(),
        rua: localizacao.rua.trim(),
        numero: localizacao.numero.trim(),
        bairro: localizacao.bairro.trim(),
        complemento: localizacao.complemento ? localizacao.complemento.trim() : null
      }
    } else if (tipoAula === 'domicilio') {
      payload.ativo_domicilio = true
    }

    return payload
  }
}
