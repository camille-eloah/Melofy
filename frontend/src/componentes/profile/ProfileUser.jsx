import "./ProfileUser.css";
import Header from "../layout/Header";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Footer from "../layout/Footer";
import { useEffect, useRef, useState } from "react";
import EditProfileTextModal from "./modals/EditProfileTextModal";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ProfileUser({ usuario: usuarioProp = {}, activities = [], currentUser: currentUserProp = null }) {
  const defaultIntroText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const defaultDescText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ac dui quis libero suscipit volutpat in ut lacus. In blandit cursus nibh quis eleifend. Praesent a leo ut nibh mattis ultrices at at ex. Donec finibus felis neque, a suscipit mauris imperdiet nec. Sed ex ipsum, porttitor a sodales eget, tempor nec nisi. Morbi tortor diam, iaculis in volutpat a, pharetra eget erat. Nam elementum nisi ex, id facilisis enim facilisis eu. Praesent a ipsum lorem. Sed ac massa aliquam, rutrum ligula nec, sagittis tellus. Nam egestas urna lectus, ut ultricies sem hendrerit ut. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque mattis malesuada erat eget pellentesque. Nunc feugiat mauris condimentum mauris rutrum aliquet. Praesent dui diam, maximus vel ultrices sit amet, aliquam a quam.\nPhasellus malesuada est ut accumsan efficitur. Proin laoreet quis magna consectetur malesuada. Cras nec felis non eros pulvinar mollis. Aliquam egestas nunc at fringilla porttitor. Mauris facilisis arcu id nulla dapibus egestas quis ac eros. Nullam fermentum ultrices tellus, malesuada tempus est. Donec viverra, tortor non efficitur ultricies, diam tortor faucibus ante, id porta leo nisi nec purus.";
  const normalizeTagResponse = (tag) => {
    const name = tag?.nome || tag?.name || tag;
    if (!name) return null;
    return {
      name,
      isInstrument: Boolean(tag?.is_instrument || tag?.instrumento_id || (tag?.tipo || "").toUpperCase() === "INSTRUMENTO"),
    };
  };
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditTextsModalOpen, setIsEditTextsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingTexts, setIsSavingTexts] = useState(false);
  const [cacheBust, setCacheBust] = useState(Date.now());
  const [instrumentosProfessor, setInstrumentosProfessor] = useState([]);
  const [tags, setTags] = useState([]);
  const [hasEditedTags, setHasEditedTags] = useState(false);
  const [introText, setIntroText] = useState(() => usuarioProp?.texto_intro || defaultIntroText);
  const [descText, setDescText] = useState(() => usuarioProp?.texto_desc || defaultDescText);
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

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [pacote, setPacote] = useState({
    quantidade: "",
    valor: "",
  });

  useEffect(() => {
    // SIMULA usuário logado professor para eu poder entrar sem acesso ao back
    setCurrentUser({ id: 1, nome: "Teste", tipo_usuario: "PROFESSOR" });
    setUsuario({ id: 1, nome: "Teste", tipo_usuario: "PROFESSOR" });
  }, []);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [agendamento, setAgendamento] = useState({
    data: "",
    horario: "",
    atividade: "",
  });
  const openScheduleModal = () => setIsScheduleModalOpen(true);
  const closeScheduleModal = () => setIsScheduleModalOpen(false);
  const handleChangeAgendamento = (e) => {
    const { name, value } = e.target;
    setAgendamento(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmarAgendamento = () => {
    console.log("Dados do agendamento enviados:", agendamento);

    // Quando o backend estiver pronto, usar:
    /*
    fetch(`${API_BASE_URL}/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agendamento),
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        console.log("Agendamento salvo!", data);
        alert("Agendamento concluído!");
        closeScheduleModal();
      })
      .catch(error => console.error("Erro ao salvar agendamento:", error));
    */

    // Código temporário só pra mostrar feedback
    alert("Agendamento enviado! (quando o back estiver pronto irá salvar)");
    closeScheduleModal();
  };


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
  async function handleSubmitPacote() {
    if (!pacote.quantidade || !pacote.valor) {
      alert("Preencha os campos corretamente");
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/pacotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          qtd_aulas: pacote.quantidade,
          preco: pacote.valor,
        }),
      });

      alert("Pacote cadastrado com sucesso!");
      setIsPackageModalOpen(false);
      setPacote({ quantidade: "", valor: "" });

    } catch (error) {
      alert("Erro ao cadastrar pacote");
    }
  }

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

  useEffect(() => {
    if (!isProfessor || !usuarioId) {
      if (!hasEditedTags) setTags([]);
      return;
    }

    let active = true;
    fetch(`${API_BASE_URL}/user/${usuarioId}/tags`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("tags_fetch_failed");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        const mapped = (data || []).map(normalizeTagResponse).filter(Boolean);
        if (mapped.length > 0) {
          setTags(mapped);
          setHasEditedTags(true);
        } else if (!hasEditedTags) {
          setTags([]);
        }
      })
      .catch(() => {
        /* ignora erros silenciosamente */
      });

    return () => {
      active = false;
    };
  }, [isProfessor, usuarioId, hasEditedTags]);

  useEffect(() => {
    if (hasEditedTags) return;
    const nomesInstrumentos = instrumentosProfessor.map((instrumento) => instrumento?.nome || instrumento?.tipo).filter(Boolean);
    const mapped = nomesInstrumentos.map((nome) => ({ name: nome, isInstrument: true }));
    setTags(mapped);
  }, [instrumentosProfessor, hasEditedTags]);

  const closeModal = () => setIsModalOpen(false);
  const closeEditTextsModal = () => setIsEditTextsModalOpen(false);

  const openEditTextsModal = () => {
    setIsEditTextsModalOpen(true);
  };

  const handleSaveTexts = async (values) => {
    if (!usuario?.id || isSavingTexts || !isOwner) return;
    setIsSavingTexts(true);
    const introPayload = values?.intro ?? introText;
    const descPayload = values?.desc ?? descText;
    const tagsPayload = Array.isArray(values?.tags) ? values.tags : tags;
    const tagNames = (tagsPayload || [])
      .map((tag) => {
        if (typeof tag === "string") return tag;
        return tag?.name || tag?.nome || "";
      })
      .map((name) => (name || "").trim())
      .filter(Boolean);
    try {
      const payload = { texto_intro: introPayload, texto_desc: descPayload };
      const textoPromise = fetch(`${API_BASE_URL}/user/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const tagsPromise = isProfessor
        ? fetch(`${API_BASE_URL}/user/${usuario.id}/tags`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: tagNames }),
          credentials: "include",
        })
        : null;

      const [textoResp, tagsResp] = await Promise.all([textoPromise, tagsPromise]);

      if (!textoResp.ok) {
        throw new Error(`Falha ao salvar textos: ${textoResp.status}`);
      }
      const data = await textoResp.json();
      setUsuario((prev) => ({ ...prev, ...data }));
      setIntroText(data?.texto_intro ?? introPayload);
      setDescText(data?.texto_desc ?? descPayload);
      setHasEditedTexts(true);

      if (tagsResp) {
        if (!tagsResp.ok) {
          throw new Error(`Falha ao salvar tags: ${tagsResp.status}`);
        }
        const tagsData = await tagsResp.json();
        const normalized = (tagsData || []).map(normalizeTagResponse).filter(Boolean);
        setTags(normalized);
      } else {
        setTags(tagsPayload);
      }
      setHasEditedTags(true);
      setIsEditTextsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar textos do perfil", error);
    } finally {
      setIsSavingTexts(false);
    }
  };

  const displayTags =
    tags && tags.length > 0
      ? tags
      : instrumentosProfessor
        .map((instrumento) => {
          const name = instrumento?.nome || instrumento?.tipo;
          if (!name) return null;
          return { name, isInstrument: true };
        })
        .filter(Boolean);

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
              {displayTags.map((tag, index) => {
                const name = tag?.name || tag?.nome || String(tag);
                const key = `${name}-${index}`;
                const isInstrument = Boolean(tag?.isInstrument || tag?.instrumento_id);
                return (
                  <span key={key} className={`categoria-item${isInstrument ? " categoria-item-instrument" : ""}`}>
                    {name}
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
                <button className="btn-cadastrarpacote" onClick={() => setIsPackageModalOpen(true)}>
                  Cadastrar Pacote
                </button>
              </div>
            )}

            {!isOwner && (
              <div className="botoes">
                <button className="btn-agendar" onClick={openScheduleModal}>
                  Agendar Aula
                </button>
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

        <EditProfileTextModal
          open={isEditTextsModalOpen}
          onClose={closeEditTextsModal}
          onSave={handleSaveTexts}
          initialIntro={introText}
          initialDesc={descText}
          initialTags={tags}
          isSaving={isSavingTexts}
        />

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
      {isScheduleModalOpen && (
        <div className="modal-backdrop" onClick={closeScheduleModal}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="modal-header">
              <h5>Agendar Aula</h5>
              <button className="modal-close" onClick={closeScheduleModal}>x</button>
            </div>

            <div className="modal-body">
              <label>
                Data:
                <input
                  type="date"
                  name="data"
                  value={agendamento.data}
                  onChange={handleChangeAgendamento}
                />
              </label>

              <label>
                Horário:
                <input
                  type="time"
                  name="horario"
                  value={agendamento.horario}
                  onChange={handleChangeAgendamento}
                />
              </label>

              <label>
                Atividade:
                <input
                  type="text"
                  name="atividade"
                  placeholder="Ex: Aula de Canto"
                  value={agendamento.atividade}
                  onChange={handleChangeAgendamento}
                />
              </label>
            </div>

            <button onClick={handleConfirmarAgendamento}>
              Confirmar
            </button>

          </div>
        </div>
      )}

      {isPackageModalOpen && (
        <div className="pacote-modal-overlay">
          <div className="pacote-modal-container">

            <h3>Cadastrar Pacote de Aula</h3>

            {/* Nome/Descrição do Pacote */}
            <div className="pacote-input-group">
              <label>Nome ou Descrição do Pacote</label>
              <input
                type="text"
                placeholder="Ex.: Pacote Mensal Premium"
                value={pacote.nome}
                onChange={(e) =>
                  setPacote({ ...pacote, nome: e.target.value })
                }
              />
            </div>

            {/* Quantidade de aulas */}
            <div className="pacote-input-group">
              <label>Quantidade de Aulas</label>
              <input
                type="number"
                min={1}
                placeholder="Ex.: 4"
                value={pacote.quantidade}
                onChange={(e) =>
                  setPacote({ ...pacote, quantidade: e.target.value })
                }
              />
            </div>

            {/* Valor total */}
            <div className="pacote-input-group">
              <label>Valor Total (R$)</label>
              <input
                type="number"
                placeholder="Ex.: 280"
                value={pacote.valorTotal}
                onChange={(e) =>
                  setPacote({ ...pacote, valorTotal: e.target.value })
                }
              />
            </div>

            {/* Ações */}
            <button
              className="pacote-btn-confirmar"
              onClick={handleSubmitPacote}
            >
              Salvar Pacote
            </button>

            <button
              className="pacote-btn-cancelar"
              onClick={() => setIsPackageModalOpen(false)}
            >
              Cancelar
            </button>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ProfileUser;

