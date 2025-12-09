import React, { useState } from "react";
import "./ScheduleClassModal.css";
import Calendar from "react-calendar";
import Swal from "sweetalert2";

const ScheduleClassModal = ({
    isOpen,
    onClose,
    pacotes = [],
    handleConfirmarAgendamento,
}) => {
    const horariosDisponiveis = ["09:00", "10:30", "14:00", "16:00", "19:00"];

    const [calendarDate, setCalendarDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);

    if (!isOpen) return null;

    console.log("[ScheduleClassModal] Pacotes recebidos:", pacotes);
    console.log("[ScheduleClassModal] Quantidade de pacotes:", pacotes.length);

    // Função para alternar seleção de horário
    const toggleTimeSelection = (time) => {
        if (!selectedPackage) return;

        const maxHorarios = selectedPackage.pac_quantidade_aulas;

        setSelectedTimes((prev) => {
            if (prev.includes(time)) {
                // Remove o horário se já estiver selecionado
                return prev.filter((t) => t !== time);
            } else {
                // Adiciona o horário se não atingiu o limite
                if (prev.length < maxHorarios) {
                    return [...prev, time];
                }
                return prev; // Não adiciona se já atingiu o limite
            }
        });
    };

    // Calcular quantos horários ainda precisam ser selecionados
    const horariosRestantes = selectedPackage 
        ? selectedPackage.pac_quantidade_aulas - selectedTimes.length 
        : 0;

    // Verificar se pode confirmar (todos os horários foram selecionados)
    const podeConfirmar = selectedPackage && selectedTimes.length === selectedPackage.pac_quantidade_aulas;

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
        const horariosOrdenados = selectedTimes.sort();
        const listaHorarios = horariosOrdenados.map(h => `<li style="text-align: left;">${h}</li>`).join('');

        const result = await Swal.fire({
            title: 'Confirmar Agendamento',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p>Você está prestes a solicitar as seguintes aulas:</p>
                    <p style="margin-top: 15px;"><strong>Pacote:</strong> ${selectedPackage.pac_nome}</p>
                    <p><strong>Data:</strong> ${formatarData(selectedDate)}</p>
                    <p><strong>Horários selecionados:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${listaHorarios}
                    </ul>
                    <p style="margin-top: 15px;">Tem certeza que deseja confirmar esses horários?</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim, confirmar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#8338EC',
            cancelButtonColor: '#6c757d',
        });

        if (result.isConfirmed) {
            confirmar();
        }
    };

    const confirmar = () => {
        handleConfirmarAgendamento({
            date: selectedDate,
            times: selectedTimes,
            pacote: selectedPackage,
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
                                        setSelectedTimes([]); // Limpa horários ao trocar de pacote
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
                            setSelectedTimes([]); // Limpa horários ao trocar de data
                        }}
                        value={calendarDate}
                        minDate={new Date()}
                    />
                </div>

                {selectedDate && selectedPackage && (
                    <div className="schedule-form-group">
                        <label>
                            Horários disponíveis: 
                            {horariosRestantes > 0 && (
                                <span className="schedule-feedback">
                                    {" "}(Selecione mais {horariosRestantes} horário{horariosRestantes > 1 ? 's' : ''})
                                </span>
                            )}
                            {horariosRestantes === 0 && selectedTimes.length > 0 && (
                                <span className="schedule-feedback-success">
                                    {" "}✓ Todos os horários selecionados
                                </span>
                            )}
                        </label>
                        <div className="schedule-horarios-grid">
                            {horariosDisponiveis.map((h) => (
                                <button
                                    key={h}
                                    className={`schedule-horario-btn ${selectedTimes.includes(h) ? "selected" : ""}`}
                                    onClick={() => toggleTimeSelection(h)}
                                    disabled={!selectedTimes.includes(h) && selectedTimes.length >= selectedPackage.pac_quantidade_aulas}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
