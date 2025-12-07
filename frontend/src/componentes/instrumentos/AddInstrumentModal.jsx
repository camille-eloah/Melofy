import React, { useEffect, useRef, useState } from "react";

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

  const [isListOpen, setIsListOpen] = useState(false);
  const blurTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (blurTimeout.current) {
        clearTimeout(blurTimeout.current);
      }
    };
  }, []);

  const handleFocus = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setIsListOpen(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setIsListOpen(false), 120);
  };

  const handleOptionClick = (inst) => {
    onSelectChange?.(inst.id);
    onSearchChange?.(inst.nome);
    setIsListOpen(false);
  };

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
          <label htmlFor="instrument-search">Instrumento</label>
          <div className={`instrumentos-combobox ${isListOpen ? "open" : ""}`}>
            <input
              id="instrument-search"
              type="text"
              placeholder="Digite para filtrar"
              value={searchValue}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => {
                onSearchChange?.(e.target.value);
                setIsListOpen(true);
              }}
            />
            {isListOpen && (
              <div className="instrumentos-combobox-list" onMouseDown={(e) => e.preventDefault()}>
                {options.length === 0 && (
                  <div className="instrumentos-combobox-empty">Nenhum instrumento encontrado</div>
                )}
                {options.map((inst) => (
                  <button
                    key={inst.id}
                    type="button"
                    className={
                      "instrumentos-combobox-option" +
                      (String(selectedValue) === String(inst.id) ? " selected" : "")
                    }
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleOptionClick(inst)}
                  >
                    {inst.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
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
