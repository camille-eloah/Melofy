function ProfilePictureModal({
  open,
  onClose,
  displayedPicture,
  nomeUsuario,
  fileInputRef,
  selectedFile,
  onFileChange,
  onSelectFileClick,
  onUpload,
  isUploading,
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pre-visualizacao da foto de perfil"
      >
        <div className="modal-header">
          <h5>Pré-visualização</h5>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>
        <div className="modal-body">
          {displayedPicture ? (
            <img src={displayedPicture} alt={`Pre-visualizacao de ${nomeUsuario}`} />
          ) : (
            <div className="modal-placeholder">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
          )}
        </div>
        <div className="modal-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          <div className="modal-file-info">
            {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
          </div>
          <button className="btn-select-file" type="button" onClick={onSelectFileClick}>
            Selecionar imagem
          </button>
          <button
            className="btn-upload"
            type="button"
            onClick={onUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Enviando..." : "Salvar foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePictureModal;
