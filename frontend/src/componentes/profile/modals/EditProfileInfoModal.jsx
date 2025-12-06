import "./EditProfileInfoModal.css";

function EditProfileInfoModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Editar Perfil"
      >
        <div className="modal-header">
          <h5>Editar Perfil</h5>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-input-group">
            <span className="modal-label">Foto</span>
            <div className="modal-photo-row">
              <div className="modal-photo-preview">:D</div>
              <button type="button" className="btn-select-file">
                Selecionar imagem
              </button>
            </div>
          </div>

          <label className="modal-input-group">
            <span className="modal-label">Nome</span>
            <input type="text" placeholder="Seu nome" />
          </label>

          <label className="modal-input-group">
            <span className="modal-label">E-mail</span>
            <input type="email" placeholder="email@exemplo.com" />
          </label>

          <label className="modal-input-group">
            <span className="modal-label">Telefone</span>
            <input type="tel" placeholder="(00) 00000-0000" />
          </label>

          <label className="modal-input-group">
            <span className="modal-label">Bio</span>
            <textarea rows={3} placeholder="Conte um pouco sobre você" />
          </label>
        </div>

        <div className="modal-footer">
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