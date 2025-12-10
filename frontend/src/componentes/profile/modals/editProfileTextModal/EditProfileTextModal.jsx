import { useEffect } from "react";
import { useProfileTextForm } from "../../hooks/useProfileTextForm";
import "./EditProfileTextModal.css";

function EditProfileTextModal({
  open,
  onClose,
  onSave,
  initialIntro = "",
  initialDesc = "",
  initialTags = [],
  isSaving = false,
}) {
  const {
    intro,
    desc,
    tags,
    tagInput,
    setIntro,
    setDesc,
    setTagInput,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    resetForm,
    canAddTag,
    maxTags,
  } = useProfileTextForm({ initialIntro, initialDesc, initialTags });

  useEffect(() => {
    if (open) {
      resetForm({ intro: initialIntro, desc: initialDesc, tags: initialTags });
    }
  }, [open, initialIntro, initialDesc, initialTags, resetForm]);

  if (!open) return null;

  const handleSaveClick = () => {
    onSave?.({
      intro,
      desc,
      tags,
    });
  };

  return (
    <div className="edit-profile-text-backdrop" onClick={onClose}>
      <div
        className="edit-profile-text-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Editar textos do perfil"
      >
        <div className="edit-profile-text-header">
          <h5>Editar textos do perfil</h5>
          <button className="edit-profile-text-close" onClick={onClose} aria-label="Fechar modal">
            x
          </button>
        </div>

        <div className="edit-profile-text-body">
          <label className="edit-profile-text-group">
            <span className="edit-profile-text-label">Titulo</span>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              className="edit-profile-textarea"
            />
          </label>

          <label className="edit-profile-text-group">
            <span className="edit-profile-text-label">Descrição</span>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="edit-profile-textarea"
            />
          </label>

          <div className="edit-profile-text-group">
            <span className="edit-profile-text-label">Tags</span>
            <div className="tags-editor">
              <div className="tags-list">
                {[...tags]
                  .sort((a, b) => {
                    const aIsInst = Boolean(a?.isInstrument || a?.instrumento_id);
                    const bIsInst = Boolean(b?.isInstrument || b?.instrumento_id);
                    if (aIsInst === bIsInst) {
                      return (a?.name || a?.nome || "").localeCompare(b?.name || b?.nome || "");
                    }
                    return aIsInst ? -1 : 1;
                  })
                  .map((tag) => {
                  const name = tag?.name || tag?.nome || String(tag);
                  const isInstrument = Boolean(tag?.isInstrument || tag?.instrumento_id);
                  const badgeClass = `tag-badge${isInstrument ? " tag-badge-instrument" : ""}`;
                  return (
                    <span key={name} className={badgeClass}>
                      <span className="tag-label">{name}</span>
                      <button
                        type="button"
                        className={`tag-remove${isInstrument ? " white-color-text" : ""}`}
                        aria-label={`Remover tag ${name}`}
                        onClick={() => removeTag(tag)}
                      >
                        x
                      </button>
                    </span>
                  );
                })}

                {canAddTag && (
                  <div className="tag-add">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      maxLength={30}
                      placeholder="Nova tag"
                    />
                    <button type="button" onClick={addTag} aria-label="Adicionar nova tag">
                      +
                    </button>
                  </div>
                )}
              </div>
              <div className="tags-helper">
                {tags.length}/{maxTags} tags
              </div>
            </div>
          </div>
        </div>

        <div className="edit-profile-text-footer">
          <button className="edit-profile-text-btn-save" type="button" onClick={handleSaveClick} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar"}
          </button>
          <button className="edit-profile-text-btn-cancel" type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileTextModal;
