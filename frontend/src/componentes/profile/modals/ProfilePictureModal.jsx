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
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pre-visualizacao da foto de perfil"
      >
        <div className="profile-modal-header">
          <h5>Pré-visualização</h5>
          <button className="profile-modal-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>
        <div className="profile-modal-body">
          {displayedPicture ? (
            <img src={displayedPicture} alt={`Pre-visualizacao de ${nomeUsuario}`} />
          ) : (
            <div className="profile-modal-placeholder">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
          )}
        </div>
        <div className="profile-modal-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          <div className="profile-modal-file-info">
            {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
          </div>
          <button className="profile-btn-select-file" type="button" onClick={onSelectFileClick}>
            Selecionar imagem
          </button>
          <button
            className="profile-btn-upload"
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
