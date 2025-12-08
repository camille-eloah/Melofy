import React, { useState } from "react";
import "./ScheduleClassModal.css";
import Calendar from "react-calendar";

const ScheduleClassModal = ({
    isOpen,
    onClose,
    pacotes = [],
    handleConfirmarAgendamento,
}) => {
    const horariosDisponiveis = ["09:00", "10:30", "14:00", "16:00", "19:00"];

    const [calendarDate, setCalendarDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);

    if (!isOpen) return null;

    console.log("[ScheduleClassModal] Pacotes recebidos:", pacotes);
    console.log("[ScheduleClassModal] Quantidade de pacotes:", pacotes.length);

    const confirmar = () => {
        handleConfirmarAgendamento({
            date: selectedDate,
            time: selectedTime,
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
                                    onClick={() => setSelectedPackage(p)}
                                >
                                    <div className="schedule-package-card">
                                        <span className="schedule-package-name">{p.pac_nome}</span>
                                        <span className="schedule-package-info">
                                            {p.pac_quantidade_aulas} aulas — R$ {Number(p.pac_valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                            setSelectedTime("");
                        }}
                        value={calendarDate}
                        minDate={new Date()}
                    />
                </div>

                {selectedDate && (
                    <div className="schedule-form-group">
                        <label>Horários disponíveis:</label>
                        <div className="schedule-horarios-grid">
                            {horariosDisponiveis.map((h) => (
                                <button
                                    key={h}
                                    className={`schedule-horario-btn ${selectedTime === h ? "selected" : ""
                                        }`}
                                    onClick={() => setSelectedTime(h)}
                                >
                                    {h}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    className="schedule-btn-confirmar"
                    disabled={!selectedTime || !selectedPackage}
                    onClick={confirmar}
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
