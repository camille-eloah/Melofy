import "./EditProfileInfoModal.css";

function EditProfileInfoModal({ open, onClose, displayedPicture, nomeUsuario = "", isOwner = false, onPhotoClick }) {
  const handlePhotoKeyDown = (event) => {
    if (!onPhotoClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPhotoClick();
    }
  };

  if (!open) return null;

  return (
    <div className="edit-profile-info-backdrop" onClick={onClose}>
      <div
        className="edit-profile-info-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Editar Perfil"
      >
        <div className="edit-profile-info-header">
          <h5>Editar Perfil</h5>
          <button className="edit-profile-info-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <div className="edit-profile-info-body">
          <div className="edit-profile-info-input-group">
            <span className="edit-profile-info-label">Foto</span>
            <div className="edit-profile-info-photo-row">
              <div
                className={`foto-wrapper ${isOwner && onPhotoClick ? "foto-interativa" : ""}`}
                onClick={onPhotoClick}
                role={onPhotoClick ? "button" : "img"}
                tabIndex={onPhotoClick ? 0 : -1}
                onKeyDown={handlePhotoKeyDown}
              >
                {displayedPicture ? (
                  <img src={displayedPicture} alt={`Foto de ${nomeUsuario}`} className="foto-perfil" />
                ) : (
                  <div className="foto-vazia">{nomeUsuario?.[0]?.toUpperCase() || "?"}</div>
                )}
                {onPhotoClick && (
                  <div className="foto-overlay">
                    <span className="camera-icon" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 7h4l2-3h4l2 3h4v12H4z" />
                        <circle cx="12" cy="13" r="3.2" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>

            </div>
          </div>

          <label className="edit-profile-info-input-group">
            <span className="edit-profile-info-label">Nome</span>
            <input type="text" placeholder="Seu nome" />
          </label>

          <label className="edit-profile-info-input-group">
            <span className="edit-profile-info-label">E-mail</span>
            <input type="email" placeholder="email@exemplo.com" />
          </label>

          <label className="edit-profile-info-input-group">
            <span className="edit-profile-info-label">Telefone</span>
            <input type="tel" placeholder="(00) 00000-0000" />
          </label>

          <label className="edit-profile-info-input-group">
            <span className="edit-profile-info-label">Bio</span>
            <textarea rows={3} placeholder="Conte um pouco sobre vocǦ" />
          </label>
        </div>

        <div className="edit-profile-info-footer">
          <button className="btn-upload-edit-profile" type="button">
            Salvar
          </button>
          <button className="btn-cancel-edit-profile" type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileInfoModal;
