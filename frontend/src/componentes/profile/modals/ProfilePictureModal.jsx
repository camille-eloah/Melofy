import "./ProfilePictureModal.css";

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
    <div className="profile-picture-backdrop" onClick={onClose}>
      <div
        className="profile-picture-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pre-visualizacao da foto de perfil"
      >
        <div className="profile-picture-header">
          <h5>Pré-visualização</h5>
          <button className="profile-picture-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>
        <div className="profile-picture-body">
          {displayedPicture ? (
            <img src={displayedPicture} alt={`Pre-visualizacao de ${nomeUsuario}`} />
          ) : (
            <div className="profile-picture-placeholder">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
          )}
        </div>
        <div className="profile-picture-footer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={onFileChange}
          />
          <div className="profile-picture-file-info">
            {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
          </div>
          <button className="profile-picture-btn-select" type="button" onClick={onSelectFileClick}>
            Selecionar imagem
          </button>
          <button
            className="profile-picture-btn-upload"
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
