import "./EditProfileInfoModal.css";

function EditProfileInfoModal({ open, onClose }) {
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
              <div className="edit-profile-info-preview">:D</div>
              <button type="button" className="edit-profile-info-btn-select-file">
                Selecionar imagem
              </button>
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
            <textarea rows={3} placeholder="Conte um pouco sobre você" />
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