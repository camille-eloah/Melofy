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

  // Estados para solicitações de aula
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loadingSolicitacoes, setLoadingSolicitacoes] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('todas')

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

  // Função para carregar solicitações de aula
  const carregarSolicitacoes = useCallback(async () => {
    try {
      setLoadingSolicitacoes(true);
      
      // Simulação de dados - substitua pela sua API real
      const mockSolicitacoes = [
        {
          id: 1,
          aluno: {
            nome: 'João Silva',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            instrumento: 'Violão',
            nivel: 'Iniciante'
          },
          modalidade: 'presencial',
          pacote: '4 aulas mensais',
          valor: 320.00,
          observacao: 'Preciso de horários no período da manhã, antes do trabalho.',
          dataSolicitacao: '2024-01-15',
          horariosSolicitados: ['Segunda 08:00', 'Quarta 09:00'],
          status: 'pendente'
        },
        {
          id: 2,
          aluno: {
            nome: 'Maria Santos',
            foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
            instrumento: 'Piano',
            nivel: 'Intermediário'
          },
          modalidade: 'remota',
          pacote: '8 aulas mensais',
          valor: 640.00,
          observacao: 'Gostaria de foco em teoria musical e composição.',
          dataSolicitacao: '2024-01-14',
          horariosSolicitados: ['Terça 14:00', 'Quinta 15:00'],
          status: 'pendente'
        },
        {
          id: 3,
          aluno: {
            nome: 'Carlos Oliveira',
            foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
            instrumento: 'Guitarra',
            nivel: 'Avançado'
          },
          modalidade: 'domicilio',
          pacote: '4 aulas mensais',
          valor: 400.00,
          observacao: 'Moramos no centro, próximo à praça principal.',
          dataSolicitacao: '2024-01-13',
          horariosSolicitados: ['Sexta 17:00', 'Sábado 10:00'],
          status: 'confirmada'
        },
        {
          id: 4,
          aluno: {
            nome: 'Ana Costa',
            foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
            instrumento: 'Violino',
            nivel: 'Iniciante'
          },
          modalidade: 'presencial',
          pacote: '2 aulas semanais',
          valor: 160.00,
          observacao: '',
          dataSolicitacao: '2024-01-12',
          horariosSolicitados: ['Segunda 16:00'],
          status: 'recusada'
        },
        {
          id: 5,
          aluno: {
            nome: 'Pedro Almeida',
            foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
            instrumento: 'Bateria',
            nivel: 'Intermediário'
          },
          modalidade: 'remota',
          pacote: '12 aulas trimestrais',
          valor: 960.00,
          observacao: 'Preciso de horários noturnos, após às 19h.',
          dataSolicitacao: '2024-01-11',
          horariosSolicitados: ['Terça 19:00', 'Quinta 20:00'],
          status: 'cancelada'
        }
      ];
      
      setSolicitacoes(mockSolicitacoes);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    } finally {
      setLoadingSolicitacoes(false);
    }
  }, []);

  // Função para aceitar solicitação
  const aceitarSolicitacao = useCallback(async (solicitacaoId) => {
    try {
      // Simulação de API - substitua pela sua implementação real
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId ? { ...sol, status: 'confirmada' } : sol
      ));
      
      // Aqui você faria a chamada para sua API
      // await api.put(`/solicitacoes/${solicitacaoId}/aceitar`);
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Solicitação aceita com sucesso!',
        icon: 'success',
        confirmButtonText: 'Ok'
      });
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível aceitar a solicitação',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      throw error;
    }
  }, []);

  // Função para recusar solicitação
  const recusarSolicitacao = useCallback(async (solicitacaoId) => {
    try {
      // Simulação de API - substitua pela sua implementação real
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId ? { ...sol, status: 'recusada' } : sol
      ));
      
      // Aqui você faria a chamada para sua API
      // await api.put(`/solicitacoes/${solicitacaoId}/recusar`);
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Solicitação recusada.',
        icon: 'info',
        confirmButtonText: 'Ok'
      });
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível recusar a solicitação',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      throw error;
    }
  }, []);

  // Função para cancelar solicitação
  const cancelarSolicitacao = useCallback(async (solicitacaoId) => {
    try {
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId ? { ...sol, status: 'cancelada' } : sol
      ));
      
      Swal.fire({
        title: 'Sucesso!',
        text: 'Aula cancelada com sucesso.',
        icon: 'info',
        confirmButtonText: 'Ok'
      });
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível cancelar a aula',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
      throw error;
    }
  }, []);

  // Filtro de solicitações por status
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    if (filtroStatus === 'todas') return true;
    return solicitacao.status === filtroStatus;
  });

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
    error,
    // Novas funções para solicitações
    solicitacoes,
    loadingSolicitacoes,
    filtroStatus,
    setFiltroStatus,
    carregarSolicitacoes,
    aceitarSolicitacao,
    recusarSolicitacao,
    cancelarSolicitacao,
    solicitacoesFiltradas
  }
}