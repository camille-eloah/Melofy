import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { configAulaService } from '../services/configAulaService'
import { tipoAulaService } from '../modules/TipoAulaModal/tipoAulaService'
import { horariosService } from '../services/horariosService'

export const useDashProfessor = () => {
  const [valorHora, setValorHora] = useState('')
  const [tiposAulaSelecionados, setTiposAulaSelecionados] = useState([])
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
  const [taxaPorKm, setTaxaPorKm] = useState('')
  const [raioAtendimento, setRaioAtendimento] = useState('5')
  
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({
    segunda: { selecionado: false, horarios: [] },
    terca: { selecionado: false, horarios: [] },
    quarta: { selecionado: false, horarios: [] },
    quinta: { selecionado: false, horarios: [] },
    sexta: { selecionado: false, horarios: [] },
    sabado: { selecionado: false, horarios: [] },
    domingo: { selecionado: false, horarios: [] }
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [configsSalvas, setConfigsSalvas] = useState(null)

  const diasSemana = [
    { id: 'segunda', label: 'Segunda-feira' },
    { id: 'terca', label: 'Terça-feira' },
    { id: 'quarta', label: 'Quarta-feira' },
    { id: 'quinta', label: 'Quinta-feira' },
    { id: 'sexta', label: 'Sexta-feira' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ]

  const horariosDoDia = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']

  const carregarConfiguracoes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Carregar configurações de aula da API real
      const configs = await configAulaService.obterConfiguracoes()
      
      setConfigsSalvas(configs)
      
      if (configs.config_geral?.valor_hora_aula) {
        setValorHora(configs.config_geral.valor_hora_aula.toString())
      }

      const tipos = []
      if (configs.config_remota?.ativo) tipos.push('remota')
      if (configs.config_presencial?.ativo) tipos.push('presencial')
      if (configs.config_domicilio?.ativo) tipos.push('domicilio')
      setTiposAulaSelecionados(tipos)

      setStatusModalidades({
        remota: configs.config_remota?.ativo ?? false,
        presencial: configs.config_presencial?.ativo ?? false,
        domicilio: configs.config_domicilio?.ativo ?? false
      })

      if (configs.config_remota?.link_meet) {
        setLinkGoogleMeet(configs.config_remota.link_meet)
      }

      if (configs.config_presencial) {
        setLocalizacao({
          cidade: configs.config_presencial.cidade || '',
          estado: configs.config_presencial.estado || '',
          rua: configs.config_presencial.rua || '',
          numero: configs.config_presencial.numero || '',
          bairro: configs.config_presencial.bairro || '',
          complemento: configs.config_presencial.complemento || ''
        })
      }
      
      // Carregar horários disponíveis da API real
      try {
        const horarios = await horariosService.carregarHorarios()
        setHorariosDisponiveis(horarios)
      } catch (horarioError) {
        console.error('Erro ao carregar horários:', horarioError)
        // Mantém estado inicial se falhar
      }
      
      if (configs.config_domicilio?.taxa_por_km) {
        setTaxaPorKm(configs.config_domicilio.taxa_por_km.toString())
      }
      
      if (configs.config_domicilio?.raio_km) {
        setRaioAtendimento(configs.config_domicilio.raio_km.toString())
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

  const toggleDiaSemana = useCallback((diaId) => {
    setHorariosDisponiveis(prev => ({
      ...prev,
      [diaId]: {
        ...prev[diaId],
        selecionado: !prev[diaId].selecionado
      }
    }))
  }, [])

  const toggleHorario = useCallback((diaId, horario) => {
    setHorariosDisponiveis(prev => {
      const diaAtual = prev[diaId]
      const horariosAtuais = diaAtual.horarios
      
      const novosHorarios = horariosAtuais.includes(horario)
        ? horariosAtuais.filter(h => h !== horario)
        : [...horariosAtuais, horario]
      
      return {
        ...prev,
        [diaId]: {
          ...diaAtual,
          horarios: novosHorarios
        }
      }
    })
  }, [])

  const toggleTipoAula = useCallback((tipo) => {
    setTiposAulaSelecionados(prev => {
      const isCurrentlySelected = prev.includes(tipo)
      if (isCurrentlySelected) {
        setStatusModalidades(prevStatus => ({
          ...prevStatus,
          [tipo]: false
        }))
        return prev.filter(t => t !== tipo)
      } else {
        setStatusModalidades(prevStatus => ({
          ...prevStatus,
          [tipo]: true
        }))
        return [...prev, tipo]
      }
    })
  }, [])

  const toggleStatusModalidade = useCallback((tipo, event) => {
    event.stopPropagation()
    setStatusModalidades(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }))
  }, [])

  const handleSave = useCallback(async () => {
    try {
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

      // Mapear tipos de aula do frontend para o backend
      const tiposAulaBackend = tiposAulaSelecionados.map(tipo => {
        if (tipo === 'remota') return 'remota'
        if (tipo === 'presencial') return 'presencial'
        if (tipo === 'domicilio') return 'domicilio'
        return tipo
      })

      const dadosFormatados = {
        valor_hora_aula: parseFloat(valorHora),
        tipos_aula_selecionados: tiposAulaBackend,
        
        // Campos específicos para aula remota
        link_meet: tiposAulaSelecionados.includes('remota') ? linkGoogleMeet : null,
        ativo_remota: tiposAulaSelecionados.includes('remota') ? statusModalidades.remota : null,
        
        // Campos específicos para aula presencial
        localizacao: tiposAulaSelecionados.includes('presencial') ? {
          cidade: localizacao.cidade,
          estado: localizacao.estado,
          rua: localizacao.rua,
          numero: localizacao.numero,
          bairro: localizacao.bairro,
          complemento: localizacao.complemento || null
        } : null,
        ativo_presencial: tiposAulaSelecionados.includes('presencial') ? statusModalidades.presencial : null,
        
        // Campos específicos para aula domicílio
        ativo_domicilio: tiposAulaSelecionados.includes('domicilio') ? statusModalidades.domicilio : null,
        raio_km: tiposAulaSelecionados.includes('domicilio') ? parseInt(raioAtendimento) || 5 : null,
        taxa_por_km: tiposAulaSelecionados.includes('domicilio') ? (taxaPorKm ? parseFloat(taxaPorKm) : 0) : null
      }

      console.log('[useDashProfessor] Dados de configuração a serem salvos:', dadosFormatados)
      
      // Salvar configurações de aula
      await configAulaService.salvarConfiguracao(dadosFormatados)

      // Salvar horários disponíveis separadamente
      console.log('[useDashProfessor] Horários a serem salvos:', horariosDisponiveis)
      await horariosService.salvarHorarios(horariosDisponiveis)

      Swal.fire({
        title: 'Sucesso',
        text: 'Configurações e horários salvos com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ok'
      })
    } catch (err) {
      console.error('[useDashProfessor] Erro ao salvar:', err)
      console.error('[useDashProfessor] Stack trace:', err.stack)
      setError(err.message)

      let errorMessage = err.message || 'Erro ao salvar configurações'
      
      // Verificar se é erro de validação específico
      if (errorMessage.includes('estado') || errorMessage.includes('state')) {
        errorMessage = 'O campo Estado deve ter exatamente 2 letras (ex: RN, SP, RJ)'
      } else if (errorMessage.includes('horario')) {
        errorMessage = 'Erro nos horários: ' + errorMessage
      } else if (errorMessage.includes('dia_semana')) {
        errorMessage = 'Erro no dia da semana: ' + errorMessage
      }

      Swal.fire({
        title: 'Erro ao Salvar',
        html: `<div style="text-align: left; white-space: pre-wrap;">${errorMessage}</div>`,
        icon: 'error',
        confirmButtonText: 'Ok',
        width: '600px'
      })
    } finally {
      setIsSaving(false)
    }
  }, [
    tiposAulaSelecionados, 
    statusModalidades, 
    valorHora, 
    linkGoogleMeet, 
    localizacao, 
    raioAtendimento,
    taxaPorKm,
    horariosDisponiveis
  ])

  const handleLocalizacaoChange = useCallback((field, value) => {
    setLocalizacao(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  return {
    valorHora,
    setValorHora,
    tiposAulaSelecionados,
    toggleTipoAula,
    toggleStatusModalidade,
    statusModalidades,
    linkGoogleMeet,
    setLinkGoogleMeet,
    localizacao,
    handleLocalizacaoChange,
    isSaving,
    carregarConfiguracoes,
    handleSave,
    configsSalvas,
    raioAtendimento,
    setRaioAtendimento,
    horariosDisponiveis,
    toggleDiaSemana,
    toggleHorario,
    diasSemana,
    horariosDoDia,
    taxaPorKm,
    setTaxaPorKm,
    isLoading,
    error
  }
}