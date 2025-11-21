import "./ProfileUser.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ProfileUser({ usuario: usuarioProp = {}, activities = [], currentUser: currentUserProp = null }) {
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id: userIdParam } = useParams();

  useEffect(() => {
    // se houver um id na rota, buscar o perfil correspondente
    if (!userIdParam) return;

    fetch(`${API_BASE_URL}/user/${userIdParam}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("not_found");
      })
      .then((data) => {
        setUsuario(data);
      })
      .catch((err) => {
        if (err.message === "not_found") {
          navigate("/home");
        }
      });
  }, [userIdParam, navigate]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("erro");
      })
      .then((data) => {
        setCurrentUser(data || null);
        // se estamos no proprio perfil ou sem id na rota, e ainda nao temos usuario, preenche
        if ((!userIdParam || String(userIdParam) === String(data.id)) && !(usuario && usuario.id)) {
          setUsuario(data || {});
        }
      })
      .catch((err) => {
        if (err.message === "unauthorized") {
          navigate("/login");
        }
      });
  }, [navigate, userIdParam]);

  const nomeUsuario = usuario?.nome || "Usuario Desconhecido";
  const profilePicture = usuario?.profile_picture || null;
  const podeEditar = currentUser?.id && usuario?.id && currentUser.id === usuario.id;
  const displayedPicture = previewUrl || profilePicture;

  const handleFotoClick = () => {
    if (podeEditar) {
      setIsModalOpen(true);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="profile-page">
      {/* Cabecalho azul escuro */}
      <header className="profile-header">
        <div className="profile-header-left">
          <span className="brand">MELOFY</span>
        </div>

        <nav className="profile-header-nav">
          <Link to="/home">Tela Inicial</Link>
          <a href="#">Dar aulas</a>
          <a href="#">Conectar</a>
        </nav>
      </header>

      <div className="profile-container">
        {/* Container top-items acima do main-text */}
        <div className="top-items">
          {/* Categorias no inicio (esquerda) */}
          <div className="categorias">
            <span className="categoria-item">Guitarra</span>
            <span className="categoria-item">Violao</span>
            <span className="categoria-item">Ukulele</span>
          </div>

          {/* Botao de edicao no final (direita)*/}
          {podeEditar && (
            <button className="btn-editar-texto" title="Editar textos">
              <span aria-hidden="true">✎</span>
            </button>
          )}
        </div>

        {/* Texto principal a esquerda */}
        <div className="main-text">
          <div className="texto-intro">
            <p>
              Aulas totalmente voltadas ao repertorio que o aluno quer aprender! Guitarra, Violao e Ukulele.
            </p>
          </div>

          <div className="texto-desc">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
        </div>

        {/* Cartao de perfil a direita */}
        <div className="card-perfil">
          <div
            className={`foto-wrapper ${podeEditar ? "foto-interativa" : ""}`}
            onClick={handleFotoClick}
            role={podeEditar ? "button" : undefined}
            tabIndex={podeEditar ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFotoClick();
              }
            }}
          >
            {displayedPicture ? (
              <img src={displayedPicture} alt={`Foto de ${nomeUsuario}`} className="foto-perfil" />
            ) : (
              <div className="foto-vazia">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
            )}
            {podeEditar && (
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
          <p className="avaliacao">&lt;Avaliacao&gt;</p>

          <div className="info">
            <p>
              <span>Email:</span>
              <span>{usuario.email || "Nao informado"}</span>
            </p>
            <p>
              <span>Telefone:</span>
              <span>{usuario.telefone || "Nao informado"}</span>
            </p>
            <p className="bio-text">{usuario.bio || "Nenhuma descricao informada."}</p>
          </div>

          {podeEditar && (
            <div className="botoes">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-deletar">Deletar Conta</button>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Pre-visualizacao da foto de perfil"
            >
              <div className="modal-header">
                <h5>Pré-visualizacao</h5>
                <button className="modal-close" onClick={closeModal} aria-label="Fechar modal">
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
                  onChange={handleFileChange}
                />
                <div className="modal-file-info">
                  {selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}
                </div>
                <button className="btn-upload" type="button" onClick={handleUploadClick}>
                  Fazer upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Avaliacoes abaixo */}
        <div className="avaliacoes">
          <h4>&lt;Avaliacoes&gt;</h4>
          <div className="box-avaliacao avaliacao-card">
            <span className="star">★</span>
            <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec venenatis, ligula sit amet efficitur
              maximus, purus ligula viverra eros, eu pellentesque.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUser;
