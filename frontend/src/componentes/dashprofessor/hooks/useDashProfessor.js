import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { configAulaService } from '../services/configAulaService'
import { tipoAulaService } from '../modules/TipoAulaModal/tipoAulaService'

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
      
      const dummyData = {
        config_geral: { valor_hora_aula: 80.00 },
        config_remota: { 
          ativo: true, 
          link_meet: 'https://meet.google.com/abc-defg-hij' 
        },
        config_presencial: { 
          ativo: true,
          cidade: 'São Paulo',
          estado: 'SP',
          rua: 'Av. Paulista',
          numero: '1000',
          bairro: 'Bela Vista',
          complemento: 'Sala 203'
        },
        config_domicilio: { 
          ativo: true,
          raio_km: 5,
          taxa_por_km: 2.50
        },
        horarios_disponiveis: {
          segunda: { selecionado: true, horarios: ['14:00', '15:00', '16:00'] },
          terca: { selecionado: true, horarios: ['09:00', '10:00', '14:00'] },
          quarta: { selecionado: false, horarios: [] },
          quinta: { selecionado: true, horarios: ['18:00', '19:00'] },
          sexta: { selecionado: true, horarios: ['16:00', '17:00', '18:00'] },
          sabado: { selecionado: false, horarios: [] },
          domingo: { selecionado: false, horarios: [] }
        }
      }
      
      setConfigsSalvas(dummyData)
      
      if (dummyData.config_geral?.valor_hora_aula) {
        setValorHora(dummyData.config_geral.valor_hora_aula.toString())
      }

      const tipos = []
      if (dummyData.config_remota?.ativo) tipos.push('remota')
      if (dummyData.config_presencial?.ativo) tipos.push('presencial')
      if (dummyData.config_domicilio?.ativo) tipos.push('domicilio')
      setTiposAulaSelecionados(tipos)

      setStatusModalidades({
        remota: dummyData.config_remota?.ativo ?? false,
        presencial: dummyData.config_presencial?.ativo ?? false,
        domicilio: dummyData.config_domicilio?.ativo ?? false
      })

      if (dummyData.config_remota?.link_meet) {
        setLinkGoogleMeet(dummyData.config_remota.link_meet)
      }

      if (dummyData.config_presencial) {
        setLocalizacao({
          cidade: dummyData.config_presencial.cidade || '',
          estado: dummyData.config_presencial.estado || '',
          rua: dummyData.config_presencial.rua || '',
          numero: dummyData.config_presencial.numero || '',
          bairro: dummyData.config_presencial.bairro || '',
          complemento: dummyData.config_presencial.complemento || ''
        })
      }
      
      if (dummyData.horarios_disponiveis) {
        setHorariosDisponiveis(dummyData.horarios_disponiveis)
      }
      
      if (dummyData.config_domicilio?.taxa_por_km) {
        setTaxaPorKm(dummyData.config_domicilio.taxa_por_km.toString())
      }
      
      if (dummyData.config_domicilio?.raio_km) {
        setRaioAtendimento(dummyData.config_domicilio.raio_km.toString())
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

      const dadosFormatados = {
        config_geral: {
          valor_hora_aula: parseFloat(valorHora)
        },
        config_remota: tiposAulaSelecionados.includes('remota') ? {
          ativo: statusModalidades.remota,
          link_meet: linkGoogleMeet
        } : null,
        config_presencial: tiposAulaSelecionados.includes('presencial') ? {
          ativo: statusModalidades.presencial,
          cidade: localizacao.cidade,
          estado: localizacao.estado,
          rua: localizacao.rua,
          numero: localizacao.numero,
          bairro: localizacao.bairro,
          complemento: localizacao.complemento
        } : null,
        config_domicilio: tiposAulaSelecionados.includes('domicilio') ? {
          ativo: statusModalidades.domicilio,
          raio_km: parseInt(raioAtendimento) || 5,
          taxa_por_km: taxaPorKm ? parseFloat(taxaPorKm) : 0
        } : null,
        horarios_disponiveis: horariosDisponiveis
      }

      console.log('Dados a serem salvos:', dadosFormatados)
      
      await configAulaService.salvarConfiguracao(dadosFormatados)

      Swal.fire({
        title: 'Sucesso',
        text: 'Configurações salvas com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ok'
      })
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError(err.message)

      let errorMessage = err.message || 'Erro ao salvar configurações'
      if (errorMessage.includes('estado') || errorMessage.includes('state')) {
        errorMessage = 'O campo Estado deve ter exatamente 2 letras (ex: RN, SP, RJ)'
      }

      Swal.fire({
        title: 'Erro',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Ok'
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