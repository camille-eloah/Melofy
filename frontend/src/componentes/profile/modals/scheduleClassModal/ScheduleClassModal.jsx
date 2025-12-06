import React, { useState } from "react";
import "./ScheduleClassModal.css";
import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";

const ScheduleClassModal = ({
    isOpen,
    onClose,
    handleConfirmarAgendamento,
}) => {
    if (!isOpen) return null;

    const horariosDisponiveis = ["09:00", "10:30", "14:00", "16:00", "19:00"];

    const [calendarDate, setCalendarDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedPackage, setSelectedPackage] = useState(null);


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


    const pacotesCriados = [
        { id: 1, nome: "Pacote Mensal Premium", quantidade: 4, valorTotal: 280 },
        { id: 2, nome: "Pacote Semanal Rápido", quantidade: 1, valorTotal: 80 },
        { id: 3, nome: "Pacote Intensivo de Provas", quantidade: 6, valorTotal: 390 },
    ];

    return (
        <div className="schedule-modal-overlay" onClick={onClose}>
            <div
                className="schedule-modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <h3>Solicitar Agendamento</h3>

                <div className="schedule-form-group">
                    <label>Selecione um pacote:</label>

                    <div className="schedule-horarios-grid">
                        {pacotesCriados.map((p) => (
                            <button
                                key={p.id}
                                className={`schedule-horario-btn ${selectedPackage?.id === p.id ? "selected" : ""}`}
                                onClick={() => setSelectedPackage(p)}
                            >
                                <div className="schedule-package-card">
                                    <span className="schedule-package-name">{p.nome}</span>
                                    <span className="schedule-package-info">
                                        {p.quantidade} aulas — R$ {p.valorTotal}
                                    </span>
                                </div>

                            </button>
                        ))}
                    </div>
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
