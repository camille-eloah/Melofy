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

  // Estados para pacotes
  const [pacotes, setPacotes] = useState([])
  const [isLoadingPacotes, setIsLoadingPacotes] = useState(false)

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
      
      // Buscar solicitações reais da API
      const response = await fetch('http://localhost:8000/schedule/agendamentos/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar solicitações');
      }

      const solicitacoesData = await response.json();
      
      // Transformar dados da API para o formato do componente
      const solicitacoesFormatadas = await Promise.all(solicitacoesData.map(async (sol) => {
        console.log('Processando solicitação:', sol.sol_id, 'Aluno UUID:', sol.sol_alu_global_uuid, 'Aluno ID:', sol.sol_alu_id);
        
        // Buscar informações do aluno - tentar primeiro por ID, depois por UUID
        let alunoData = { nome: 'Aluno', profile_picture: null };
        try {
          // Tentar buscar por ID primeiro (mais confiável)
          let alunoResponse = await fetch(`http://localhost:8000/user/aluno/${sol.sol_alu_id}`, {
            credentials: 'include',
          });
          
          // Se não encontrar por ID, tentar por UUID
          if (!alunoResponse.ok) {
            console.log('Tentando buscar por UUID...');
            alunoResponse = await fetch(`http://localhost:8000/user/uuid/${sol.sol_alu_global_uuid}`, {
              credentials: 'include',
            });
          }
          
          console.log('Response do aluno:', alunoResponse.status, alunoResponse.ok);
          if (alunoResponse.ok) {
            alunoData = await alunoResponse.json();
            console.log('✅ Dados do aluno carregados:', alunoData);
          } else {
            const errorText = await alunoResponse.text();
            console.error('❌ Erro ao buscar aluno:', {
              id: sol.sol_alu_id,
              uuid: sol.sol_alu_global_uuid,
              status: alunoResponse.status,
              error: errorText
            });
          }
        } catch (error) {
          console.error('❌ Exceção ao buscar aluno:', error);
        }
        
        // Buscar informações do instrumento
        let instrumentoData = { nome: 'Instrumento' };
        try {
          const instrumentoResponse = await fetch(`http://localhost:8000/instruments/${sol.sol_instr_id}`, {
            credentials: 'include',
          });
          if (instrumentoResponse.ok) {
            instrumentoData = await instrumentoResponse.json();
          }
        } catch (error) {
          console.error('Erro ao buscar instrumento:', error);
        }
        
        // Buscar informações do pacote
        let pacoteData = null;
        if (sol.sol_pac_id) {
          try {
            const pacoteResponse = await fetch(`http://localhost:8000/lessons/pacotes/${sol.sol_pac_id}`, {
              credentials: 'include',
            });
            if (pacoteResponse.ok) {
              pacoteData = await pacoteResponse.json();
              console.log('Pacote carregado:', pacoteData);
            } else {
              console.warn('Erro ao buscar pacote:', sol.sol_pac_id, pacoteResponse.status);
            }
          } catch (error) {
            console.error('Erro ao buscar pacote:', error);
          }
        }
        
        // Formatar horários agrupados por data
        const horariosFormatados = sol.horarios.map(h => {
          const data = new Date(h.horario_data + 'T00:00:00');
          const diaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][data.getDay()];
          return `${diaSemana} ${h.horario_hora}`;
        });
        
        console.log('Dados finais da solicitação:', {
          id: sol.sol_id,
          alunoNome: alunoData.nome,
          instrumentoNome: instrumentoData.nome,
          pacoteNome: pacoteData?.pac_nome,
          valor: pacoteData?.pac_valor_total
        });
        
        return {
          id: sol.sol_id,
          aluno: {
            nome: alunoData.nome || 'Aluno',
            foto: alunoData.profile_picture || 'https://via.placeholder.com/100',
            instrumento: instrumentoData.nome || 'Instrumento',
            nivel: sol.sol_nivel || 'Não informado'
          },
          modalidade: sol.sol_modalidade,
          pacote: pacoteData?.pac_nome || 'Pacote não disponível',
          valor: pacoteData?.pac_valor_total ? Number(pacoteData.pac_valor_total) : 0,
          observacao: sol.sol_mensagem,
          dataSolicitacao: sol.sol_criado_em,
          horariosSolicitados: horariosFormatados,
          status: sol.sol_status.toLowerCase()
        };
      }));
      
      setSolicitacoes(solicitacoesFormatadas);
      
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setSolicitacoes([]);
    } finally {
      setLoadingSolicitacoes(false);
    }
  }, []);

  // Função para aceitar solicitação
  const aceitarSolicitacao = useCallback(async (solicitacaoId) => {
    try {
      const response = await fetch(`http://localhost:8000/schedule/agendamentos/${solicitacaoId}/aceitar`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao aceitar solicitação');
      }
      
      // Atualizar estado local
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId ? { ...sol, status: 'confirmada' } : sol
      ));
      
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
      const response = await fetch(`http://localhost:8000/schedule/agendamentos/${solicitacaoId}/recusar`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao recusar solicitação');
      }
      
      // Atualizar estado local
      setSolicitacoes(prev => prev.map(sol => 
        sol.id === solicitacaoId ? { ...sol, status: 'recusada' } : sol
      ));
      
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
      const response = await fetch(`http://localhost:8000/schedule/agendamentos/${solicitacaoId}/cancelar`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar agendamento');
      }
      
      // Atualizar estado local
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

  // Função para carregar pacotes do professor
  const carregarPacotes = useCallback(async () => {
    setIsLoadingPacotes(true)
    try {
      const response = await fetch(`${configAulaService.API_BASE_URL}/lessons/pacotes/`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          setPacotes(Array.isArray(data) ? data : [])
          console.log('✅ Pacotes carregados:', data)
        } else {
          console.error('❌ Resposta não é JSON:', contentType)
          setPacotes([])
        }
      } else {
        console.error('⚠️ Erro ao carregar pacotes:', response.status)
        setPacotes([])
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pacotes:', error)
      setPacotes([])
    } finally {
      setIsLoadingPacotes(false)
    }
  }, [])

  // Função para deletar pacote
  const handleDeletePackage = useCallback(async (pac) => {
    const confirmDelete = await Swal.fire({
      title: 'Deletar Pacote?',
      text: `Você tem certeza que deseja deletar "${pac.pac_nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    })

    if (confirmDelete.isConfirmed) {
      try {
        const resp = await fetch(`${configAulaService.API_BASE_URL}/lessons/pacotes/${pac.pac_id}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        if (resp.ok) {
          await Swal.fire('Deletado!', 'Pacote removido com sucesso.', 'success')
          await carregarPacotes()
        } else if (resp.status === 400) {
          // Pacote tem solicitações vinculadas
          const errorData = await resp.json()
          await Swal.fire({
            title: 'Não é possível deletar',
            text: errorData.detail || 'Este pacote possui solicitações de aula vinculadas.',
            icon: 'warning',
            confirmButtonText: 'Entendi'
          })
        } else {
          throw new Error('Erro ao deletar')
        }
      } catch (error) {
        console.error('Erro ao deletar pacote:', error)
        Swal.fire('Erro!', 'Falha ao deletar pacote.', 'error')
      }
    }
  }, [carregarPacotes])

  // Função para editar pacote
  const handleEditPackage = useCallback(async (pac) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Pacote',
      html: `
        <div style="text-align: left;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nome do Pacote</label>
          <input id="pac_nome" class="swal2-input" value="${pac.pac_nome}" style="width: 90%; margin: 0 0 1rem 0;">
          
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantidade de Aulas</label>
          <input id="pac_quantidade_aulas" type="number" class="swal2-input" value="${pac.pac_quantidade_aulas}" style="width: 90%; margin: 0 0 1rem 0;">
          
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Valor Total (R$)</label>
          <input id="pac_valor_total" type="number" step="0.01" class="swal2-input" value="${pac.pac_valor_total}" style="width: 90%; margin: 0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nome = document.getElementById('pac_nome').value
        const quantidade = document.getElementById('pac_quantidade_aulas').value
        const valor = document.getElementById('pac_valor_total').value

        if (!nome || !quantidade || !valor) {
          Swal.showValidationMessage('Todos os campos são obrigatórios')
          return false
        }

        if (quantidade <= 0) {
          Swal.showValidationMessage('Quantidade deve ser maior que zero')
          return false
        }

        if (valor <= 0) {
          Swal.showValidationMessage('Valor deve ser maior que zero')
          return false
        }

        return {
          pac_nome: nome,
          pac_quantidade_aulas: parseInt(quantidade),
          pac_valor_total: parseFloat(valor)
        }
      }
    })

    if (formValues) {
      try {
        const resp = await fetch(`${configAulaService.API_BASE_URL}/lessons/pacotes/${pac.pac_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formValues)
        })

        if (resp.ok) {
          await Swal.fire('Atualizado!', 'Pacote atualizado com sucesso.', 'success')
          await carregarPacotes()
        } else {
          throw new Error('Erro ao atualizar')
        }
      } catch (error) {
        Swal.fire('Erro!', 'Falha ao atualizar pacote.', 'error')
      }
    }
  }, [carregarPacotes])

  // Função para criar novo pacote
  const handleCreatePackage = useCallback(async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Criar Novo Pacote',
      html: `
        <div style="text-align: left;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nome do Pacote</label>
          <input id="pac_nome" class="swal2-input" placeholder="Ex: Pacote 4 aulas" style="width: 90%; margin: 0 0 1rem 0;">
          
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantidade de Aulas</label>
          <input id="pac_quantidade_aulas" type="number" class="swal2-input" placeholder="Ex: 4" style="width: 90%; margin: 0 0 1rem 0;">
          
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Valor Total (R$)</label>
          <input id="pac_valor_total" type="number" step="0.01" class="swal2-input" placeholder="Ex: 300.00" style="width: 90%; margin: 0;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Criar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nome = document.getElementById('pac_nome').value
        const quantidade = document.getElementById('pac_quantidade_aulas').value
        const valor = document.getElementById('pac_valor_total').value

        if (!nome || !quantidade || !valor) {
          Swal.showValidationMessage('Todos os campos são obrigatórios')
          return false
        }

        if (quantidade <= 0) {
          Swal.showValidationMessage('Quantidade deve ser maior que zero')
          return false
        }

        if (valor <= 0) {
          Swal.showValidationMessage('Valor deve ser maior que zero')
          return false
        }

        return {
          pac_nome: nome,
          pac_quantidade_aulas: parseInt(quantidade),
          pac_valor_total: parseFloat(valor)
        }
      }
    })

    if (formValues) {
      try {
        const resp = await fetch(`${configAulaService.API_BASE_URL}/lessons/pacotes/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formValues)
        })

        if (resp.ok) {
          await Swal.fire('Criado!', 'Pacote criado com sucesso.', 'success')
          await carregarPacotes()
        } else {
          throw new Error('Erro ao criar')
        }
      } catch (error) {
        Swal.fire('Erro!', 'Falha ao criar pacote.', 'error')
      }
    }
  }, [carregarPacotes])

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
    solicitacoesFiltradas,
    // Funções e estados para pacotes
    pacotes,
    isLoadingPacotes,
    carregarPacotes,
    handleDeletePackage,
    handleEditPackage,
    handleCreatePackage
  }
}