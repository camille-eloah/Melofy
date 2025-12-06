import React from "react";

function AddInstrumentModal({
  isOpen,
  onClose,
  searchValue,
  onSearchChange,
  selectedValue,
  onSelectChange,
  options = [],
  onAdd,
}) {
  if (!isOpen) return null;

  const handleAdd = () => {
    if (onAdd) {
      onAdd(selectedValue);
    }
  };

  return (
    <div className="instrumentos-modal-backdrop" onClick={onClose}>
      <div className="instrumentos-modal" onClick={(e) => e.stopPropagation()}>
        <button className="instrumentos-modal-close" onClick={onClose}>
          x
        </button>
        <h3>Adicionar novo instrumento</h3>
        <p className="instrumentos-modal-subtitle">
          Use a busca para filtrar e selecione o instrumento que deseja incluir.
        </p>
        <div className="instrumentos-modal-field">
          <label htmlFor="instrument-search">Pesquisar</label>
          <input
            id="instrument-search"
            type="text"
            placeholder="Digite para filtrar"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
        <div className="instrumentos-modal-field">
          <label htmlFor="instrument-select">Selecione o instrumento</label>
          <select
            id="instrument-select"
            value={selectedValue}
            onChange={(e) => onSelectChange?.(e.target.value)}
          >
            <option value="">Escolha uma opcao</option>
            {options.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="instrumentos-modal-actions">
          <button className="instrumentos-modal-button ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="instrumentos-modal-button primary" onClick={handleAdd}>
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddInstrumentModal;
