import "./ProfileUser.css";
import Header from "../layout/Header";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../layout/Footer";
import { useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ProfileUser({ usuario: usuarioProp = {}, activities = [], currentUser: currentUserProp = null }) {
  const defaultIntroText = "Aulas totalmente voltadas ao repertorio que o aluno quer aprender! Guitarra, Violao e Ukulele.";
  const defaultDescText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditTextsModalOpen, setIsEditTextsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [instrumentosProfessor, setInstrumentosProfessor] = useState([]);
  const [introText, setIntroText] = useState(() => usuarioProp?.texto_intro || defaultIntroText);
  const [descText, setDescText] = useState(() => usuarioProp?.texto_desc || defaultDescText);
  const [introDraft, setIntroDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [hasEditedTexts, setHasEditedTexts] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: userIdParam, uuid: userUuidParam, tipo: tipoParam } = useParams();
  const pathSegments = (location.pathname || "").split("/").filter(Boolean);
  const tipoFromPath = (pathSegments[0] || "").toLowerCase();
  const identifierFromPath = pathSegments[1] || null;
  const tipoSlug = (tipoParam || tipoFromPath || "").toLowerCase();
  const tipoPath = tipoSlug === "professor" ? "professor" : tipoSlug === "aluno" ? "aluno" : null;
  const userIdentifier = userUuidParam || identifierFromPath || userIdParam || null;
  const isUuid = userIdentifier ? userIdentifier.includes("-") : false;

  console.log("[ProfileUser] params", {
    userIdParam,
    userUuidParam,
    identifierFromPath,
    tipoParam,
    tipoFromPath,
    tipoPath,
    location: location.pathname,
    userIdentifier,
    isUuid,
  });

  useEffect(() => {
    // se houver um identificador na rota, buscar o perfil correspondente
    if (!userIdentifier) return;

    const identifierPath = isUuid ? `uuid/${userIdentifier}` : userIdentifier;
    console.log("[ProfileUser] fetch perfil", { userIdentifier, isUuid, tipoPath, identifierPath });
    const url = tipoPath
      ? `${API_BASE_URL}/user/${tipoPath}/${identifierPath}`
      : `${API_BASE_URL}/user/${identifierPath}`;

    fetch(url)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("not_found");
      })
      .then((data) => {
        console.log("[ProfileUser] resposta perfil", { data, url });
        const tipoRetornado = (data?.tipo_usuario || data?.tipo || "").toString().toLowerCase();
        if (tipoPath && tipoRetornado !== tipoPath) {
          navigate("/home");
          return;
        }
        setUsuario(data);
        if (data?.profile_picture) setCacheBust(Date.now());
      })
      .catch((err) => {
        if (err.message === "not_found") {
          navigate("/home");
        }
      });
  }, [userIdentifier, navigate, tipoPath, isUuid]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401) return null; // sem login, segue sem redirecionar
        throw new Error("erro");
      })
      .then((data) => {
        console.log("[ProfileUser] auth/me", data);
        setCurrentUser(data || null);
        const tipoAtual = (data?.tipo_usuario || data?.tipo || "").toString().toLowerCase();
        const isMesmoId = String(userIdParam || "") === String(data?.id || "");
        const isMesmoUuid = userUuidParam && data?.global_uuid && String(userUuidParam) === String(data.global_uuid);
        const isMesmoPathId = identifierFromPath && !isUuid && String(identifierFromPath) === String(data?.id || "");
        const isMesmoPathUuid = identifierFromPath && isUuid && data?.global_uuid && String(identifierFromPath) === String(data.global_uuid);
        const tipoConfere = !tipoPath || tipoPath === tipoAtual;
        const isMesmoUsuario = (isMesmoId || isMesmoUuid || isMesmoPathId || isMesmoPathUuid) && tipoConfere;
        // só preenche com o próprio usuário se for o mesmo id/uuid (rota) e o tipo da rota (se houver) combinar
        if ((!userIdentifier && !(usuario && usuario.id)) || (isMesmoUsuario && !(usuario && usuario.id))) {
          setUsuario(data || {});
          if (data?.profile_picture) setCacheBust(Date.now());
        }
      })
      .catch(() => {
        /* ignora falhas de rede sem redirecionar */
      });
  }, [navigate, userIdParam, userUuidParam, userIdentifier, tipoPath, usuario, isUuid, identifierFromPath]);

  const nomeUsuario = usuario?.nome || "Usuario Desconhecido";
  const profilePicture = usuario?.profile_picture || null;
  const absoluteProfilePicture =
    profilePicture && !profilePicture.startsWith("http")
      ? `${API_BASE_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`
      : profilePicture;
  const tipoAtual = (currentUser?.tipo_usuario || currentUser?.tipo || "").toString().toLowerCase();
  const tipoPerfil = (usuario?.tipo_usuario || usuario?.tipo || tipoPath || "").toString().toLowerCase();
  const isOwner =
    currentUser?.id &&
    usuario?.id &&
    currentUser.id === usuario.id &&
    (!tipoPath || tipoPath === tipoAtual) &&
    (!tipoPerfil || tipoPerfil === tipoAtual);
  const tipoUsuario = (usuario?.tipo_usuario || usuario?.tipo || tipoPath || "").toString().toUpperCase();
  const badgeInfo =
    tipoUsuario === "PROFESSOR"
      ? { label: "Professor", variant: "professor" }
      : tipoUsuario === "ALUNO"
        ? { label: "Aluno", variant: "aluno" }
        : null;
  const usuarioId = usuario?.id ?? null;
  const isProfessor = tipoPerfil === "professor";
  const displayedPicture =
    previewUrl ||
    (absoluteProfilePicture
      ? `${absoluteProfilePicture}${absoluteProfilePicture.includes("?") ? "&" : "?"}v=${cacheBust}`
      : null);

  const handleFotoClick = () => {
    if (isOwner) {
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

  const handleUploadSubmit = () => {
    if (!selectedFile || !usuario?.id || isUploading) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    fetch(`${API_BASE_URL}/user/${usuario.id}/profile-picture`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("upload_failed");
      })
      .then((data) => {
        setUsuario((prev) => ({ ...prev, profile_picture: data.profile_picture }));
        setCacheBust(Date.now());
        setPreviewUrl(null);
        setSelectedFile(null);
        setIsModalOpen(false);
      })
      .catch((err) => {
        console.error("Falha ao fazer upload da foto", err);
      })
      .finally(() => setIsUploading(false));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (hasEditedTexts) return;
    setIntroText(usuario?.texto_intro || defaultIntroText);
    setDescText(usuario?.texto_desc || defaultDescText);
  }, [usuario?.id, usuario?.texto_intro, usuario?.texto_desc, defaultIntroText, defaultDescText, hasEditedTexts]);

  useEffect(() => {
    if (!isProfessor || !usuarioId) {
      setInstrumentosProfessor([]);
      return;
    }

    let isActive = true;
    const endpoints = [
      `${API_BASE_URL}/instrumentos/professor/${usuarioId}`,
      `${API_BASE_URL}/instruments/professor/${usuarioId}`,
    ];

    const carregarInstrumentos = async () => {
      for (const url of endpoints) {
        try {
          const resp = await fetch(url);
          if (!resp.ok) continue;
          const data = await resp.json();
          if (!isActive) return;
          const instrumentos = Array.isArray(data) ? data : data.instrumentos || [];
          setInstrumentosProfessor(instrumentos || []);
          return;
        } catch (error) {
          /* tenta prximo endpoint */
        }
      }
      if (isActive) setInstrumentosProfessor([]);
    };

    carregarInstrumentos();

    return () => {
      isActive = false;
    };
  }, [isProfessor, usuarioId]);

  const closeModal = () => setIsModalOpen(false);
  const closeEditTextsModal = () => setIsEditTextsModalOpen(false);

  const openEditTextsModal = () => {
    setIntroDraft(introText);
    setDescDraft(descText);
    setIsEditTextsModalOpen(true);
  };

  const handleSaveTexts = () => {
    setIntroText(introDraft);
    setDescText(descDraft);
    setHasEditedTexts(true);
    setIsEditTextsModalOpen(false);
  };

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-container">
        <div className="lado-esquerdo-profile">
        {/* Container top-items acima do main-text */}
        <div className="top-items">
          {/* Categorias no inicio (esquerda) */}
          <div className="categorias">
            {badgeInfo && (
              <span className={`categoria-item categoria-badge categoria-badge-${badgeInfo.variant}`}>
                {badgeInfo.label}
              </span>
            )}
            {isProfessor &&
              instrumentosProfessor.map((instrumento) => {
                const nomeInstrumento = instrumento?.nome || instrumento?.tipo || "Instrumento";
                const key = instrumento?.id ?? nomeInstrumento;
                return (
                  <span key={key} className="categoria-item">
                    {nomeInstrumento}
                  </span>
                );
              })}
          </div>

          {/* Botao de edicao no final (direita)*/}
          {isOwner && (
            <button className="btn-editar-texto" title="Editar textos" onClick={openEditTextsModal}>
              <span aria-hidden="true">✎</span>
            </button>
          )}
        </div>

        {/* Texto principal a esquerda */}
        <div className="main-text">
          <div className="texto-intro">
            <p>
              {introText}
            </p>
          </div>

          <div className="texto-desc">
            <p>{descText}</p>
          </div>
        </div>

        </div>

        {/* Cartao de perfil a direita */}
        <div className="lado-direito-profile">
        <div className="card-perfil">
          <div
            className={`foto-wrapper ${isOwner ? "foto-interativa" : ""}`}
            onClick={isOwner ? handleFotoClick : undefined}
            role={isOwner ? "button" : undefined}
            tabIndex={isOwner ? 0 : undefined}
            onKeyDown={(e) => {
              if (isOwner && (e.key === "Enter" || e.key === " ")) {
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

          {isOwner && (
            <div className="botoes">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-deletar">Deletar Conta</button>
            </div>
          )}
        </div>
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
                <button className="btn-select-file" type="button" onClick={handleUploadClick}>
                  Selecionar imagem
                </button>
                <button
                  className="btn-upload"
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Enviando..." : "Salvar foto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isEditTextsModalOpen && (
          <div className="modal-backdrop" onClick={closeEditTextsModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Editar textos do perfil"
            >
              <div className="modal-header">
                <h5>Editar textos do perfil</h5>
                <button className="modal-close" onClick={closeEditTextsModal} aria-label="Fechar modal">
                  x
                </button>
              </div>
              <div className="modal-body" style={{ flexDirection: "column", gap: "12px" }}>
                <label className="modal-input-group">
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>Título</span>
                  <textarea
                    value={introDraft}
                    onChange={(e) => setIntroDraft(e.target.value)}
                    rows={3}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  />
                </label>
                <label className="modal-input-group">
                  <span style={{ fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>Descrição</span>
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    rows={4}
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button className="btn-upload" type="button" onClick={handleSaveTexts}>
                  Salvar
                </button>
                <button className="btn-select-file" type="button" onClick={closeEditTextsModal}>
                  Cancelar
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
      <Footer />
    </div>
  );
}

export default ProfileUser;

