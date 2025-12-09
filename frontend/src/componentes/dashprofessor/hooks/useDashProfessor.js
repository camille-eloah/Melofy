import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { configAulaService } from '../services/configAulaService'
import { tipoAulaService } from '../modules/TipoAulaModal/tipoAulaService'

/**
 * Custom hook para gerenciar o estado e lógica do Dashboard Professor
 * Encapsula toda a lógica de configuração de aulas
 */
export const useDashProfessor = () => {
  // Estado de dados
  const [valorHora, setValorHora] = useState('')
  const [tiposAulaSelecionados, setTiposAulaSelecionados] = useState([]) // Array de tipos selecionados
  const [statusModalidades, setStatusModalidades] = useState({
    remota: false,
    presencial: false,
    domicilio: false
  })
  const [linkGoogleMeet, setLinkGoogleMeet] = useState('')
  const [localizacao, setLocalizacao] = useState({
    cidade: '',
    estado: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: ''
  })

  // Estado de controle
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [configsSalvas, setConfigsSalvas] = useState(null)

  /**
   * Carrega configurações existentes do professor
   */
  const carregarConfiguracoes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const configs = await configAulaService.obterConfiguracoes()
      setConfigsSalvas(configs)
      
      if (configs) {
        // Carregar valor da hora
        if (configs.valor_hora_aula) {
          setValorHora(configs.valor_hora_aula.toString())
        }

        // Carregar tipos de aula configurados
        if (configs.tipos_aula_configurados && Array.isArray(configs.tipos_aula_configurados)) {
          setTiposAulaSelecionados(configs.tipos_aula_configurados)
        }

        // Carregar status das modalidades
        setStatusModalidades({
          remota: configs.config_aula_remota?.ativo ?? false,
          presencial: configs.config_aula_presencial?.ativo ?? false,
          domicilio: configs.config_aula_domicilio?.ativo ?? false
        })

        // Carregar configuração remota (Google Meet)
        if (configs.config_aula_remota?.link_meet) {
          setLinkGoogleMeet(configs.config_aula_remota.link_meet)
        }

        // Carregar configuração presencial (localização)
        if (configs.config_aula_presencial) {
          setLocalizacao({
            cidade: configs.config_aula_presencial.cidade || '',
            estado: configs.config_aula_presencial.estado || '',
            rua: configs.config_aula_presencial.rua || '',
            numero: configs.config_aula_presencial.numero || '',
            bairro: configs.config_aula_presencial.bairro || '',
            complemento: configs.config_aula_presencial.complemento || ''
          })
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError(err.message)
      
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível carregar as configurações',
        icon: 'error',
        confirmButtonText: 'Ok'
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Alterna seleção de tipo de aula (adiciona/remove do array)
   */
  const toggleTipoAula = useCallback((tipo) => {
    setTiposAulaSelecionados(prev => {
      if (prev.includes(tipo)) {
        return prev.filter(t => t !== tipo)
      } else {
        return [...prev, tipo]
      }
    })

    // Atualizar status da modalidade
    setStatusModalidades(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
  }, [])

  /**
   * Salva as configurações do professor
   */
  const handleSave = useCallback(async () => {
    try {
      // Validar dados
      const validation = tipoAulaService.validarAntesDeSalvarMultiplos(
        tiposAulaSelecionados,
        valorHora,
        linkGoogleMeet,
        localizacao
      )

      if (!validation.isValid) {
        const mensagem = validation.errors.join('\n')
        Swal.fire({
          title: 'Validação',
          text: mensagem,
          icon: 'warning',
          confirmButtonText: 'Ok'
        })
        return
      }

      setIsSaving(true)
      setError(null)

      // Formatar e enviar dados
      const dadosFormatados = tipoAulaService.formatarDadosParaAPIMultiplo(
        tiposAulaSelecionados,
        valorHora,
        linkGoogleMeet,
        localizacao
      )

      await configAulaService.salvarConfiguracao(dadosFormatados)

      // Recarregar as configurações após salvar
      await carregarConfiguracoes()

      // Sucesso
      Swal.fire({
        title: 'Sucesso',
        text: 'Configurações salvas com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ok'
      })
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError(err.message)

      Swal.fire({
        title: 'Erro',
        text: err.message || 'Erro ao salvar configurações',
        icon: 'error',
        confirmButtonText: 'Ok'
      })
    } finally {
      setIsSaving(false)
    }
  }, [tiposAulaSelecionados, valorHora, linkGoogleMeet, localizacao, carregarConfiguracoes])

  /**
   * Deleta uma configuração de tipo de aula
   */
  const handleDeleteTipo = useCallback(async (tipoAulaDeletar) => {
    try {
      const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: `Deseja remover a configuração de aula ${tipoAulaService.getTipoAulaLabel(tipoAulaDeletar)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      })

      if (!result.isConfirmed) return

      setIsSaving(true)

      await configAulaService.deletarConfiguracaoTipo(tipoAulaDeletar)

      // Remove do array de selecionados
      setTiposAulaSelecionados(prev => prev.filter(t => t !== tipoAulaDeletar))

      if (tipoAulaDeletar === 'remota') {
        setLinkGoogleMeet('')
      } else if (tipoAulaDeletar === 'presencial') {
        setLocalizacao({
          cidade: '',
          estado: '',
          rua: '',
          numero: '',
          bairro: '',
          complemento: ''
        })
      }

      Swal.fire({
        title: 'Removido',
        text: 'Configuração removida com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ok'
      })
    } catch (err) {
      console.error('Erro ao deletar configuração:', err)
      setError(err.message)

      Swal.fire({
        title: 'Erro',
        text: 'Erro ao remover configuração',
        icon: 'error',
        confirmButtonText: 'Ok'
      })
    } finally {
      setIsSaving(false)
    }
  }, [])

  /**
   * Atualiza um campo de localização
   */
  const handleLocalizacaoChange = useCallback((field, value) => {
    setLocalizacao(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  /**
   * Reseta todos os campos
   */
  const handleReset = useCallback(() => {
    setValorHora('')
    setTiposAulaSelecionados([])
    setLinkGoogleMeet('')
    setLocalizacao({
      cidade: '',
      estado: '',
      rua: '',
      numero: '',
      bairro: '',
      complemento: ''
    })
    setError(null)
  }, [])

  return {
    // Estado de dados
    valorHora,
    setValorHora,
    tiposAulaSelecionados,
    toggleTipoAula,
    statusModalidades,
    setStatusModalidades,
    linkGoogleMeet,
    setLinkGoogleMeet,
    localizacao,
    handleLocalizacaoChange,
    configsSalvas,

    // Estado de controle
    isLoading,
    isSaving,
    error,

    // Handlers
    carregarConfiguracoes,
    handleSave,
    handleDeleteTipo,
    handleReset
  }
}
