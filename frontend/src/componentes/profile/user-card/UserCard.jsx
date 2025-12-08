import Swal from "sweetalert2";
import "./UserCard.css";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function UserCard({
  usuario,
  isOwner,
  isProfessor,
  displayedPicture,
  nomeUsuario,
  ratingMedia,
  ratingTotal,
  pacotes,
  isLoadingPacotes,
  onPhotoClick,
  onEditProfileClick,
  onCreatePackageClick,
  onScheduleClassClick,
  onEnterClassClick,
  onStartChatClick,
  onEditPackageClick,
  onCarregarPacotes,
}) {
  const handleDeletePackage = async (pac) => {
    const confirmDelete = await Swal.fire({
      title: "Deletar Pacote?",
      text: `Você tem certeza que deseja deletar "${pac.pac_nome}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, deletar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (confirmDelete.isConfirmed) {
      try {
        const resp = await fetch(`${API_BASE_URL}/lessons/pacotes/${pac.pac_id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (resp.ok) {
          Swal.fire("Deletado!", "Pacote removido com sucesso.", "success");
          await onCarregarPacotes();
        } else {
          throw new Error("Erro ao deletar");
        }
      } catch (error) {
        Swal.fire("Erro!", "Falha ao deletar pacote.", "error");
      }
    }
  };

  return (
    <div className="card-perfil">
      <div
        className={`foto-wrapper ${isOwner ? "foto-interativa" : ""}`}
        onClick={isOwner ? onPhotoClick : undefined}
        role={isOwner ? "button" : undefined}
        tabIndex={isOwner ? 0 : undefined}
        onKeyDown={(e) => {
          if (isOwner && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onPhotoClick();
          }
        }}
      >
        {displayedPicture ? (
          <img src={displayedPicture} alt={`Foto de ${nomeUsuario}`} className="foto-perfil" />
        ) : (
          <div className="foto-vazia">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
        )}
        {isOwner && (
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

      <h3>{nomeUsuario}</h3>
      <div className="avaliacao-badge">
        <span className="teacher-rating">⭐ {ratingMedia}</span>
        <span className="teacher-reviews">({ratingTotal} reviews)</span>
      </div>

      <div className="info">
        <p>
          <span>Email:</span>
          <span>{usuario.email || "Nao informado"}</span>
        </p>
        <p>
          <span>Telefone:</span>
          <span>{usuario.telefone || "Nao informado"}</span>
        </p>
        {isProfessor && usuario.link_aula && (
          <p className="link-aula">
            <span>Link da Aula:</span>
            <a 
              href={usuario.link_aula} 
              onClick={(e) => {
                e.preventDefault();
                onEnterClassClick();
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="link-aula-url"
            >
              {usuario.link_aula.length > 30 
                ? `${usuario.link_aula.substring(0, 30)}...` 
                : usuario.link_aula}
            </a>
          </p>
        )}
        <p className="bio-text">{usuario.bio || "Nenhuma descricao informada."}</p>
      </div>

      {isOwner && (
        <div className="botoes">
          <button className="btn-editar" onClick={onEditProfileClick}>Editar Perfil</button>
          {isProfessor && (
            <button className="btn-cadastrarpacote" onClick={onCreatePackageClick}>
              Cadastrar Pacote
            </button>
          )}
        </div>
      )}

      {!isOwner && isProfessor && (
        <div className="botoes">
          <button className="btn-agendar" onClick={onScheduleClassClick}>
            Agendar Aula
          </button>
          {usuario.link_aula && (
            <button 
              className="btn-entrar-aula"
              onClick={onEnterClassClick}
            >
              Entrar na Aula
            </button>
          )}
          <button className="btn-agendar" type="button" onClick={onStartChatClick}>
            Enviar Mensagem
          </button>
        </div>
      )}

      {/* Seção de Pacotes do Professor */}
      {isProfessor && pacotes.length > 0 && (
        <div className="secao-pacotes">
          <h4>📦 Pacotes de Aulas</h4>
          {isLoadingPacotes ? (
            <p className="loading-pacotes">Carregando pacotes...</p>
          ) : (
            <div className="lista-pacotes">
              {pacotes.map((pac) => (
                <div key={pac.pac_id} className="card-pacote">
                  <div className="pacote-info">
                    <h5>{pac.pac_nome}</h5>
                    <p>
                      <strong>{pac.pac_quantidade_aulas}</strong> aula(s)
                    </p>
                    <p className="pacote-valor">
                      R$ <strong>{Number(pac.pac_valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    </p>
                    <p className="pacote-valor-hora">
                      <strong>R$ {Number(pac.pac_valor_hora_aula || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> por aula
                    </p>
                    {isOwner && (
                      <div className="pacote-acoes">
                        <button 
                          className="btn-editar-pacote"
                          onClick={() => onEditPackageClick(pac)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-deletar-pacote"
                          onClick={() => handleDeletePackage(pac)}
                        >
                          Deletar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserCard;
