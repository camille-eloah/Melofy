function CreatePackageModal({
  open,
  onClose,
  pacote,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="pacote-modal-overlay" onClick={onClose}>
      <div
        className="pacote-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cadastrar Pacote de Aula"
      >
        <h3>Cadastrar Pacote de Aula</h3>

        <div className="pacote-input-group">
          <label>Nome ou Descrição do Pacote</label>
          <input
            type="text"
            placeholder="Ex.: Pacote Mensal Premium"
            value={pacote.nome}
            onChange={(e) => onChange({ ...pacote, nome: e.target.value })}
          />
        </div>

        <div className="pacote-input-group">
          <label>Quantidade de Aulas</label>
          <input
            type="number"
            min={1}
            placeholder="Ex.: 4"
            value={pacote.quantidade}
            onChange={(e) => onChange({ ...pacote, quantidade: e.target.value })}
          />
        </div>

        <div className="pacote-input-group">
          <label>Valor Total (R$)</label>
          <input
            type="number"
            placeholder="Ex.: 280"
            value={pacote.valorTotal}
            onChange={(e) => onChange({ ...pacote, valorTotal: e.target.value })}
          />
        </div>

        <button
          className="pacote-btn-confirmar"
          onClick={onSubmit}
        >
          Salvar Pacote
        </button>

        <button
          className="pacote-btn-cancelar"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default CreatePackageModal;
