import React, { useState, useEffect } from "react";
import "./ScheduleClassModal.css";
import Calendar from "react-calendar";
import Swal from "sweetalert2";
import { horariosService } from "../../../dashprofessor/services/horariosService";

const ScheduleClassModal = ({
    isOpen,
    onClose,
    pacotes = [],
    modalidades = [],
    instrumentos = [],
    handleConfirmarAgendamento,
    professorId, // ID do professor para buscar horários
}) => {
    const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
    const [horariosCarregados, setHorariosCarregados] = useState(false);

    const [calendarDate, setCalendarDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedModalidade, setSelectedModalidade] = useState(null);
    const [selectedInstrumento, setSelectedInstrumento] = useState(null);
    const [observacao, setObservacao] = useState("");
    const [selectedNivel, setSelectedNivel] = useState(""); // Novo estado para nível
    const [agendamentos, setAgendamentos] = useState([]); // Array de objetos {date, time}

    // Mapa de dias da semana para IDs do frontend
    const diasSemanaMap = {
        0: 'domingo',
        1: 'segunda',
        2: 'terca',
        3: 'quarta',
        4: 'quinta',
        5: 'sexta',
        6: 'sabado'
    };

    // Carregar horários do professor quando o modal abrir
    useEffect(() => {
        const carregarHorarios = async () => {
            if (isOpen && professorId && !horariosCarregados) {
                try {
                    console.log('[ScheduleClassModal] Carregando horários do professor:', professorId);
                    const horariosPorDia = await horariosService.carregarHorariosProfessor(professorId);
                    console.log('[ScheduleClassModal] Horários recebidos:', horariosPorDia);
                    
                    // Se uma data está selecionada, filtrar horários daquele dia
                    if (selectedDate) {
                        const date = new Date(selectedDate + 'T00:00:00');
                        const diaSemana = date.getDay();
                        const diaId = diasSemanaMap[diaSemana];
                        const horariosParaDia = horariosPorDia[diaId] || [];
                        console.log('[ScheduleClassModal] Horários filtrados para', diaId, ':', horariosParaDia);
                        setHorariosDisponiveis(horariosParaDia);
                    }
                    
                    setHorariosCarregados(true);
                } catch (error) {
                    console.error('Erro ao carregar horários do professor:', error);
                    setHorariosDisponiveis([]); // Lista vazia ao invés de fallback
                }
            }
        };

        carregarHorarios();
    }, [isOpen, professorId, horariosCarregados]);

    // Atualizar horários quando a data for selecionada
    useEffect(() => {
        const atualizarHorariosPorData = async () => {
            if (selectedDate && professorId) {
                try {
                    console.log('[ScheduleClassModal] Atualizando horários para data:', selectedDate);
                    const horariosPorDia = await horariosService.carregarHorariosProfessor(professorId);
                    const date = new Date(selectedDate + 'T00:00:00');
                    const diaSemana = date.getDay();
                    const diaId = diasSemanaMap[diaSemana];
                    const horariosParaDia = horariosPorDia[diaId] || [];
                    console.log('[ScheduleClassModal] Dia da semana:', diaId, 'Horários:', horariosParaDia);
                    setHorariosDisponiveis(horariosParaDia);
                } catch (error) {
                    console.error('Erro ao atualizar horários:', error);
                }
            }
        };

        atualizarHorariosPorData();
    }, [selectedDate, professorId]);

    if (!isOpen) return null;

    console.log("[ScheduleClassModal] Pacotes recebidos:", pacotes);
    console.log("[ScheduleClassModal] Quantidade de pacotes:", pacotes.length);

    // Função para alternar seleção de horário
    const toggleTimeSelection = (time) => {
        if (!selectedPackage || !selectedDate) return;

        const maxHorarios = selectedPackage.pac_quantidade_aulas;
        const agendamentoKey = `${selectedDate}_${time}`;

        setAgendamentos((prev) => {
            const exists = prev.some(a => a.date === selectedDate && a.time === time);
            
            if (exists) {
                // Remove o agendamento
                return prev.filter(a => !(a.date === selectedDate && a.time === time));
            } else {
                // Adiciona o agendamento se não atingiu o limite
                if (prev.length < maxHorarios) {
                    return [...prev, { date: selectedDate, time: time }];
                }
                return prev; // Não adiciona se já atingiu o limite
            }
        });
    };

    // Calcular quantos horários ainda precisam ser selecionados
    const horariosRestantes = selectedPackage 
        ? selectedPackage.pac_quantidade_aulas - agendamentos.length 
        : 0;

    // Verificar se pode confirmar (todos os campos obrigatórios preenchidos)
    const podeConfirmar = 
        selectedModalidade && 
        selectedInstrumento && 
        selectedNivel && 
        selectedPackage && 
        agendamentos.length === selectedPackage.pac_quantidade_aulas;

    // Verificar se um horário específico está selecionado para a data atual
    const isHorarioSelecionado = (time) => {
        return agendamentos.some(a => a.date === selectedDate && a.time === time);
    };

    // Formatar data para exibição
    const formatarData = (dateString) => {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    const abrirConfirmacao = async () => {
        // Agrupar agendamentos por data
        const agendamentosPorData = agendamentos.reduce((acc, ag) => {
            if (!acc[ag.date]) {
                acc[ag.date] = [];
            }
            acc[ag.date].push(ag.time);
            return acc;
        }, {});

        // Criar HTML formatado agrupado por data
        const listaAgendamentos = Object.entries(agendamentosPorData)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, times]) => {
                const horariosOrdenados = times.sort();
                const listaHorarios = horariosOrdenados.map(h => `<li>${h}</li>`).join('');
                return `
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 5px 0;"><strong>${formatarData(date)}:</strong></p>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${listaHorarios}
                        </ul>
                    </div>
                `;
            }).join('');

        const result = await Swal.fire({
            title: 'Confirmar Agendamento',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p>Você está prestes a solicitar as seguintes aulas:</p>
                    <p style="margin-top: 15px;"><strong>Pacote:</strong> ${selectedPackage.pac_nome}</p>
                    <p style="margin-top: 10px;"><strong>Horários selecionados:</strong></p>
                    ${listaAgendamentos}
                    <p style="margin-top: 15px;">Tem certeza que deseja confirmar esses horários?</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6c757d',
        });

        if (result.isConfirmed) {
            confirmar();
        }
    };

    const confirmar = () => {
        handleConfirmarAgendamento({
            agendamentos: agendamentos, // Envia array de {date, time}
            pacote: selectedPackage,
            modalidade: selectedModalidade,
            instrumento: selectedInstrumento,
            nivel: selectedNivel || null, // Adiciona nível
            observacao: observacao.trim() || null,
        });

        setStatusMessage("Solicitação enviada ao professor!");

        setTimeout(() => {
            onClose();
        }, 1500);
    };

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div
                className="schedule-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Solicitar Agendamento</h3>

                {modalidades.length > 0 && (
                    <div className="schedule-form-group">
                        <label>Selecione a modalidade de aula:</label>
                        <div className="schedule-modalidades-grid">
                            {modalidades.map((mod) => (
                                <button
                                    key={mod.id}
                                    className={`schedule-modalidade-card ${selectedModalidade?.id === mod.id ? "selected" : ""}`}
                                    onClick={() => setSelectedModalidade(mod)}
                                >
                                    <div className="schedule-modalidade-icon">
                                        {mod.icon}
                                    </div>
                                    <span className="schedule-modalidade-label">{mod.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {instrumentos.length > 0 && (
                    <div className="schedule-form-group">
                        <label>Selecione o instrumento:</label>
                        <div className="schedule-instrumentos-grid">
                            {instrumentos.map((inst) => (
                                <button
                                    key={inst.id}
                                    className={`schedule-instrumento-card ${selectedInstrumento?.id === inst.id ? "selected" : ""}`}
                                    onClick={() => setSelectedInstrumento(inst)}
                                >
                                    <span className="schedule-instrumento-label">{inst.nome}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="schedule-form-group">
                    <label>Nível de conhecimento:</label>
                    <select 
                        className="schedule-nivel-select"
                        value={selectedNivel}
                        onChange={(e) => setSelectedNivel(e.target.value)}
                    >
                        <option value="">Selecione um nível</option>
                        <option value="Básico">Básico</option>
                        <option value="Intermediário">Intermediário</option>
                        <option value="Avançado">Avançado</option>
                    </select>
                </div>

                <div className="schedule-form-group">
                    <label>Selecione um pacote:</label>

                    {pacotes.length > 0 ? (
                        <div className="schedule-horarios-grid">
                            {pacotes.map((p) => (
                                <button
                                    key={p.pac_id}
                                    className={`schedule-horario-btn ${selectedPackage?.pac_id === p.pac_id ? "selected" : ""}`}
                                    onClick={() => {
                                        setSelectedPackage(p);
                                        setAgendamentos([]); // Limpa agendamentos ao trocar de pacote
                                    }}
                                >
                                    <div className="schedule-package-card">
                                        <span className="schedule-package-name">{p.pac_nome}</span>
                                        <span className="schedule-package-info">
                                            {p.pac_quantidade_aulas} aula{p.pac_quantidade_aulas > 1 ? 's' : ''} — R$ {Number(p.pac_valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="schedule-no-packages">Nenhum pacote disponível</p>
                    )}
                </div>


                <div className="schedule-form-group">
                    <label>Selecione a data:</label>

                    <Calendar
                        onChange={(value) => {
                            setCalendarDate(value);
                            setSelectedDate(value.toISOString().split("T")[0]);
                            // Não limpa mais os horários ao trocar de data
                        }}
                        value={calendarDate}
                        minDate={new Date()}
                    />
                </div>

                {selectedDate && selectedPackage && (
                    <div className="schedule-form-group">
                        <label>
                            Horários disponíveis para {formatarData(selectedDate)}:
                            {horariosRestantes > 0 && (
                                <span className="schedule-feedback">
                                    {" "}(Selecione mais {horariosRestantes} horário{horariosRestantes > 1 ? 's' : ''})
                                </span>
                            )}
                            {horariosRestantes === 0 && agendamentos.length > 0 && (
                                <span className="schedule-feedback-success">
                                    {" "}✓ Todos os horários selecionados
                                </span>
                            )}
                        </label>
                        {horariosDisponiveis.length > 0 ? (
                            <div className="schedule-horarios-grid">
                                {horariosDisponiveis.map((h) => (
                                    <button
                                        key={h}
                                        className={`schedule-horario-btn ${isHorarioSelecionado(h) ? "selected" : ""}`}
                                        onClick={() => toggleTimeSelection(h)}
                                        disabled={!isHorarioSelecionado(h) && agendamentos.length >= selectedPackage.pac_quantidade_aulas}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="schedule-no-packages">
                                📅 Nenhum horário disponível para este dia
                            </p>
                        )}
                    </div>
                )}

                {selectedPackage && agendamentos.length > 0 && (
                    <div className="schedule-form-group">
                        <label>Resumo dos horários selecionados ({agendamentos.length}/{selectedPackage.pac_quantidade_aulas}):</label>
                        <div className="schedule-resumo-agendamentos">
                            {Object.entries(
                                agendamentos.reduce((acc, ag) => {
                                    if (!acc[ag.date]) acc[ag.date] = [];
                                    acc[ag.date].push(ag.time);
                                    return acc;
                                }, {})
                            )
                            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                            .map(([date, times]) => (
                                <div key={date} className="schedule-resumo-item">
                                    <strong>{formatarData(date)}:</strong> {times.sort().join(', ')}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="schedule-form-group">
                    <label>Observação (opcional):</label>
                    <textarea
                        className="schedule-observacao-textarea"
                        placeholder="Deixe uma observação para o professor, se desejar..."
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={4}
                        maxLength={500}
                    />
                    <span className="schedule-observacao-counter">
                        {observacao.length}/500 caracteres
                    </span>
                </div>

                <button
                    className="schedule-btn-confirmar"
                    disabled={!podeConfirmar}
                    onClick={abrirConfirmacao}
                >

                    Enviar solicitação
                </button>

                <button className="schedule-btn-cancelar" onClick={onClose}>
                    Cancelar
                </button>

                {statusMessage && <p className="schedule-status">{statusMessage}</p>}
            </div>
        </div>
    );
};

export default ScheduleClassModal;
