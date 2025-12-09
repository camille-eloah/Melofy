/**
 * Hook customizado para gerenciar a lógica de seleção de Tipo de Aula
 */

import { useCallback } from 'react'
import { tipoAulaService } from './tipoAulaService'

export const useTipoAula = (tipoAula, setTipoAula, linkGoogleMeet, localizacao) => {
  /**
   * Muda o tipo de aula selecionado
   */
  const handleTipoAulaChange = useCallback((newTipoAula) => {
    if (tipoAulaService.isTipoAulaValid(newTipoAula)) {
      setTipoAula(newTipoAula)
    }
  }, [setTipoAula])

  /**
   * Valida o tipo de aula atual
   */
  const validateCurrentTipoAula = useCallback(() => {
    return tipoAulaService.validateTipoAulaRequirements(
      tipoAula,
      linkGoogleMeet,
      localizacao
    )
  }, [tipoAula, linkGoogleMeet, localizacao])

  /**
   * Obtém os tipos de aula disponíveis
   */
  const getTiposAula = useCallback(() => {
    return tipoAulaService.getTiposAula()
  }, [])

  /**
   * Verifica se o tipo atual requer informações adicionais
   */
  const requiresAdditionalInfo = useCallback(() => {
    return tipoAulaService.requiresAdditionalInfo(tipoAula)
  }, [tipoAula])

  return {
    handleTipoAulaChange,
    validateCurrentTipoAula,
    getTiposAula,
    requiresAdditionalInfo,
    service: tipoAulaService
  }
}
