import Swal from "sweetalert2";
import "./ProfileUser.css";
import Header from "../layout/Header";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ButtonChat from "../layout/ButtonChat";
import Footer from "../layout/Footer";
import { useEffect, useRef, useState, useCallback } from "react";
import EditProfileTextModal from "./modals/editProfileTextModal/EditProfileTextModal";
import EditProfileInfoModal from "./modals/editProfileInfoModal/EditProfileInfoModal";
import ProfilePictureModal from "./modals/profilePictureModal/ProfilePictureModal";
import CreatePackageModal from "./modals/createPackageModal/CreatePackageModal";
import EditPackageModal from "./modals/editPackageModal/EditPackageModal";
import ScheduleClassModal from "./modals/scheduleClassModal/ScheduleClassModal";
import Reviews from "./modals/reviews/Reviews";
import UserCard from "./user-card/UserCard";

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
  const mergeTagsUnique = (base = [], extra = []) => {
    const seen = new Set((base || []).map((t) => (t?.name || t?.nome || t || "").toLowerCase()));
    const merged = [...(base || [])];
    (extra || []).forEach((t) => {
      const key = (t?.name || t?.nome || t || "").toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push(t);
    });
    return merged;
  };
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditTextsModalOpen, setIsEditTextsModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isSavingProfileInfo, setIsSavingProfileInfo] = useState(false);
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
  const [usuarioIdState, setUsuarioIdState] = useState(() => usuarioProp?.id || null);
  const [ratingStats, setRatingStats] = useState({ media: 0, total: 0 });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { uuid: userUuidParam, tipo: tipoParam } = useParams();
  const pathSegments = (location.pathname || "").split("/").filter(Boolean);
  const tipoFromPath = (pathSegments[0] || "").toLowerCase();
  const identifierFromPath = pathSegments[1] || null;
  const tipoSlug = (tipoParam || tipoFromPath || "").toLowerCase();
  const tipoPath = tipoSlug === "professor" ? "professor" : tipoSlug === "aluno" ? "aluno" : null;
  const userIdentifier = userUuidParam || identifierFromPath || null;
  const isUuid = userIdentifier ? userIdentifier.includes("-") : false;
  const usuarioId = usuarioIdState ?? (usuarioProp?.id ?? (!isUuid && userIdentifier && !Number.isNaN(Number(userIdentifier)) ? Number(userIdentifier) : null));
  const tipoPerfil = (usuario?.tipo_usuario || usuario?.tipo || tipoPath || "").toString().toLowerCase();
  const tipoUsuario = (usuario?.tipo_usuario || usuario?.tipo || tipoPath || "").toString().toUpperCase();
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [pacote, setPacote] = useState({
    quantidade: "",
    valor: "",
    nome: "",
  });
  const [pacotes, setPacotes] = useState([]);
  const [isLoadingPacotes, setIsLoadingPacotes] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [editingPacote, setEditingPacote] = useState(null);
  const [modalidades, setModalidades] = useState([]);
  const refreshRatingStats = useCallback(() => {
    if (!usuarioId || !tipoUsuario) {
      setRatingStats({ media: 0, total: 0 });
      return Promise.resolve();
    }
    return fetch(`${API_BASE_URL}/ratings/${tipoUsuario}/${usuarioId}/stats`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("stats_error");
      })
      .then((data) => {
        setRatingStats({
          media: Number(data?.media) || 0,
          total: Number.isFinite(Number(data?.total)) ? Number(data.total) : 0,
        });
      })
      .catch(() => {
        setRatingStats({ media: 0, total: 0 });
      });
  }, [usuarioId, tipoUsuario]);

  useEffect(() => {
    setCurrentUser({ id: 1, nome: "Teste", tipo_usuario: "PROFESSOR" });
    setUsuario({ id: 1, nome: "Teste", tipo_usuario: "PROFESSOR" });
    setUsuarioIdState(1);
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

    Swal.fire({
      title: "Agendamento enviado!",
      text: "Quando o back estiver pronto irá salvar.",
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Ok"
    }).then(() => {
      closeScheduleModal();
    });
  };

  console.log("[ProfileUser] params", {
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
        if (data?.id) setUsuarioIdState(data.id);
        if (data?.profile_picture) setCacheBust(Date.now());
      })
      .catch((err) => {
        if (err.message === "not_found") {
          navigate("/home");
        }
      });
  }, [userIdentifier, navigate, tipoPath, isUuid]);

  useEffect(() => {
    if (usuario?.id && usuarioIdState !== usuario.id) {
      setUsuarioIdState(usuario.id);
    }
  }, [usuario?.id, usuarioIdState]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 401) return null;
        throw new Error("erro");
      })
      .then((data) => {
        console.log("[ProfileUser] auth/me", data);
        setCurrentUser(data || null);
        const tipoAtual = (data?.tipo_usuario || data?.tipo || "").toString().toLowerCase();
        const isMesmoUuid = userUuidParam && data?.global_uuid && String(userUuidParam) === String(data.global_uuid);
        const isMesmoPathUuid = identifierFromPath && isUuid && data?.global_uuid && String(identifierFromPath) === String(data.global_uuid);
        const tipoConfere = !tipoPath || tipoPath === tipoAtual;
        const isMesmoUsuario = (isMesmoUuid || isMesmoPathUuid) && tipoConfere;
        if ((!userIdentifier && !(usuario && usuario.id)) || (isMesmoUsuario && !(usuario && usuario.id))) {
          setUsuario(data || {});
          if (data?.id) setUsuarioIdState(data.id);
          if (data?.profile_picture) setCacheBust(Date.now());
        }
      })
      .catch(() => {});
  }, [navigate, userUuidParam, userIdentifier, tipoPath, usuario, isUuid, identifierFromPath]);

  useEffect(() => {
    refreshRatingStats();
  }, [refreshRatingStats]);

  const nomeUsuario = usuario?.nome || "Usuario Desconhecido";
  const profilePicture = usuario?.profile_picture || null;
  const absoluteProfilePicture =
    profilePicture && !profilePicture.startsWith("http")
      ? `${API_BASE_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`
      : profilePicture;
  const tipoAtual = (currentUser?.tipo_usuario || currentUser?.tipo || "").toString().toLowerCase();
  const isOwner =
    currentUser?.id &&
    usuario?.id &&
    currentUser.id === usuario.id &&
    (!tipoPath || tipoPath === tipoAtual) &&
    (!tipoPerfil || tipoPerfil === tipoAtual);
  const badgeInfo =
    tipoUsuario === "PROFESSOR"
      ? { label: "Professor", variant: "professor" }
      : tipoUsuario === "ALUNO"
        ? { label: "Aluno", variant: "aluno" }
        : null;
  const isProfessor = tipoPerfil === "professor";
  const displayedPicture =
    previewUrl ||
    (absoluteProfilePicture
      ? `${absoluteProfilePicture}${absoluteProfilePicture.includes("?") ? "&" : "?"}v=${cacheBust}`
      : null);
  const ratingMedia = Number.isFinite(ratingStats.media) ? ratingStats.media.toFixed(1) : "0.0";
  const ratingTotal = ratingStats.total ?? 0;

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
    if (!pacote.nome || !pacote.nome.trim()) {
      Swal.fire({
        title: "Campo obrigatório!",
        text: "Informe o nome do pacote",
        icon: "warning",
      });
      return false;
    }

    if (!pacote.quantidade || pacote.quantidade < 1) {
      Swal.fire({
        title: "Quantidade inválida!",
        text: "Informe pelo menos 1 aula",
        icon: "warning",
      });
      return false;
    }

    if (!pacote.valor || pacote.valor <= 0) {
      Swal.fire({
        title: "Valor inválido!",
        text: "Informe um valor maior que 0",
        icon: "warning",
      });
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/lessons/pacotes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pac_nome: pacote.nome.trim(),
          pac_quantidade_aulas: pacote.quantidade,
          pac_valor_total: pacote.valor,
        }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error?.detail || "Erro ao cadastrar pacote");
      }

      const novoPackote = await resp.json();

      Swal.fire({
        title: "Sucesso!",
        text: "Pacote cadastrado com sucesso!",
        icon: "success",
        didRender: (modal) => {
          const backdrop = document.querySelector(".swal2-container");
          if (backdrop) backdrop.style.zIndex = "9999";
        },
      });

      console.log("✅ Novo pacote criado:", novoPackote);

      setPacote({ quantidade: "", valor: "", nome: "" });

      // Recarregar lista de pacotes
      await carregarPacotes();

      return true;

    } catch (error) {
      console.error("❌ Erro ao cadastrar pacote:", error);
      Swal.fire({
        title: "Erro!",
        text: error.message || "Erro ao cadastrar pacote",
        icon: "error",
        didRender: (modal) => {
          const backdrop = document.querySelector(".swal2-container");
          if (backdrop) backdrop.style.zIndex = "9999";
        },
      });

      return false;
    }
  }

  const carregarPacotes = useCallback(async (profId = null) => {
    if (!isProfessor) return;

    setIsLoadingPacotes(true);
    try {
      // If profId is provided or user is not owner, use public endpoint
      // Otherwise use authenticated endpoint for owner's packages
      const endpoint = profId 
        ? `${API_BASE_URL}/lessons/professor/${profId}/pacotes/`
        : `${API_BASE_URL}/lessons/pacotes/`;

      const resp = await fetch(endpoint, {
        credentials: "include",
      });

      if (resp.ok) {
        const data = await resp.json();
        console.log("✅ Pacotes carregados:", data);
        setPacotes(Array.isArray(data) ? data : []);
      } else {
        console.warn("⚠️ Erro ao carregar pacotes:", resp.status);
        setPacotes([]);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar pacotes:", error);
      setPacotes([]);
    } finally {
      setIsLoadingPacotes(false);
    }
  }, [isProfessor]);

  const openEditPackageModal = (pac) => {
    setEditingPacote({ ...pac });
    setIsEditPackageModalOpen(true);
  };

  const closeEditPackageModal = () => {
    setIsEditPackageModalOpen(false);
    setEditingPacote(null);
  };

  const handleEditPacote = async (dadosEditados) => {
    if (!editingPacote?.pac_id) return false;

    try {
      const resp = await fetch(`${API_BASE_URL}/lessons/pacotes/${editingPacote.pac_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pac_nome: dadosEditados.nome.trim(),
          pac_quantidade_aulas: dadosEditados.quantidade,
          pac_valor_total: dadosEditados.valor,
        }),
      });

      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error?.detail || "Erro ao atualizar pacote");
      }

      console.log("✅ Pacote atualizado com sucesso");

      // Recarregar lista de pacotes
      await carregarPacotes();

      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar pacote:", error);
      Swal.fire({
        title: "Erro!",
        text: error.message || "Erro ao atualizar pacote",
        icon: "error",
        didRender: (modal) => {
          const backdrop = document.querySelector(".swal2-container");
          if (backdrop) backdrop.style.zIndex = "9999";
        },
      });
      return false;
    }
  };

  useEffect(() => {
    if (isProfessor && usuario?.id) {
      carregarPacotes(usuario.id);
    }
  }, [usuario?.id, isProfessor, carregarPacotes]);

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
      setModalidades([]);
      return;
    }

    // Busca as configurações do professor que está sendo visualizado
    fetch(`${API_BASE_URL}/professor/${usuarioId}/configuracoes`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        if (res.status === 404) {
          // Professor sem configurações ainda
          setModalidades([]);
          return null;
        }
        throw new Error("config_error");
      })
      .then((data) => {
        if (!data) return;
        
        const modalidadesAtivas = [];
        
        if (data?.config_remota?.ativo) {
          modalidadesAtivas.push({
            id: 'remota',
            label: 'Aula Remota',
            icon: '💻'
          });
        }
        
        if (data?.config_presencial?.ativo) {
          modalidadesAtivas.push({
            id: 'presencial',
            label: 'Aula Presencial',
            icon: '🏢'
          });
        }
        
        if (data?.config_domicilio?.ativo) {
          modalidadesAtivas.push({
            id: 'domicilio',
            label: 'Aula Domiciliar',
            icon: '🏠'
          });
        }
        
        setModalidades(modalidadesAtivas);
      })
      .catch((err) => {
        console.error("[ProfileUser] Erro ao carregar modalidades:", err);
        setModalidades([]);
      });
  }, [isProfessor, usuarioId]);

  useEffect(() => {
    if (!isProfessor) {
      setInstrumentosProfessor([]);
      setTags([]);
      console.log("[ProfileUser] instrumentos: reset (nao professor)", { isProfessor, usuarioId });
      return;
    }
    if (!usuarioId) {
      console.log("[ProfileUser] instrumentos: aguardando usuarioId", { usuarioId, userIdentifier });
      return;
    }

    let isActive = true;
    const endpoint = isUuid
      ? `${API_BASE_URL}/instruments/professor/uuid/${userIdentifier}`
      : `${API_BASE_URL}/instruments/professor/${usuarioId}`;

    const carregarInstrumentos = async () => {
      try {
        const resp = await fetch(endpoint, { credentials: "include" });
        if (!resp.ok) throw new Error(`instrumentos_fetch_failed_${resp.status}`);
        const data = await resp.json();
        if (!isActive) return;
        const instrumentos = Array.isArray(data) ? data : data.instrumentos || [];
        setInstrumentosProfessor(instrumentos || []);
        console.log("[ProfileUser] instrumentos carregados", { endpoint, instrumentos });
        const mapped = instrumentos
          .map((instrumento) => {
            const name = instrumento?.nome || instrumento?.tipo;
            if (!name) return null;
            return { name, isInstrument: true };
          })
          .filter(Boolean);
        if (!hasEditedTags && mapped.length > 0) {
          setTags(mapped);
          console.log("[ProfileUser] tags definidas a partir de instrumentos (sem edicao)", { mapped });
        } else if (mapped.length > 0) {
          setTags((prev) => {
            const existing = new Set(
              (prev || []).map((tag) => (tag?.name || tag?.nome || tag || "").toLowerCase()),
            );
            const merged = [
              ...prev,
              ...mapped.filter((tag) => !existing.has((tag?.name || "").toLowerCase())),
            ];
            console.log("[ProfileUser] tags mescladas com instrumentos", { prev, mapped, merged });
            return merged;
          });
        }
      } catch (error) {
        if (isActive) {
          setInstrumentosProfessor([]);
          if (!hasEditedTags) setTags([]);
          console.log("[ProfileUser] instrumentos: fallback vazio (erro)", { error: String(error) });
        }
      }
    };

    carregarInstrumentos();

    return () => {
      isActive = false;
    };
  }, [isProfessor, usuarioId, hasEditedTags]);

  useEffect(() => {
    if (!isProfessor) {
      setTags([]);
      console.log("[ProfileUser] tags reset (nao professor)");
      return;
    }
    if (!usuarioId) {
      console.log("[ProfileUser] tags: aguardando usuarioId", { usuarioId, userIdentifier });
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
        const instrumentTags = instrumentosProfessor
          .map((instrumento) => {
            const name = instrumento?.nome || instrumento?.tipo;
            if (!name) return null;
            return { name, isInstrument: true };
          })
          .filter(Boolean);
        if (mapped.length > 0) {
          const merged = mergeTagsUnique(mapped, instrumentTags);
          setTags(merged);
          setHasEditedTags(true);
          console.log("[ProfileUser] tags carregadas do backend + instrumentos", { mapped, instrumentTags, merged });
        } else {
          const fallback = instrumentTags;
          setTags(fallback);
          console.log("[ProfileUser] tags fallback instrumentos (backend vazio)", { fallback });
        }
      })
      .catch(() => {
        console.log("[ProfileUser] erro ao buscar tags; mantendo estado atual");
      });

    return () => {
      active = false;
    };
  }, [isProfessor, usuarioId, hasEditedTags, instrumentosProfessor]);

  useEffect(() => {
    if (hasEditedTags) return;
    if (!usuarioId) {
      console.log("[ProfileUser] tags derivadas: aguardando usuarioId", { usuarioId });
      return;
    }
    const nomesInstrumentos = instrumentosProfessor.map((instrumento) => instrumento?.nome || instrumento?.tipo).filter(Boolean);
    const mapped = nomesInstrumentos.map((nome) => ({ name: nome, isInstrument: true }));
    if (mapped.length > 0) {
      setTags(mapped);
      console.log("[ProfileUser] tags derivadas de instrumentos (hasEditedTags=false)", { mapped });
    }
  }, [instrumentosProfessor, hasEditedTags, usuarioId]);

  const closeModal = () => setIsModalOpen(false);
  const closeEditTextsModal = () => setIsEditTextsModalOpen(false);
  const openEditProfileModal = () => setIsEditProfileModalOpen(true);
  const closeEditProfileModal = () => setIsEditProfileModalOpen(false);

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
        if (tagsResp.ok) {
          const tagsData = await tagsResp.json();
          const normalized = (tagsData || []).map(normalizeTagResponse).filter(Boolean);
          setTags(normalized);
        } else {
          console.warn("[ProfileUser] falha ao salvar tags, prosseguindo", { status: tagsResp.status });
          setTags(tagsPayload);
        }
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

  const handleSaveProfileInfo = async (values) => {
    if (!usuario?.id || isSavingProfileInfo || !isOwner) return;

    const payload = {
      nome: values?.nome ?? usuario.nome ?? "",
      email: values?.email ?? usuario.email ?? "",
      telefone: values?.telefone ?? "",
      bio: values?.bio ?? "",
      link_aula: values?.link_aula ?? usuario.link_aula ?? "",
    };

    setIsSavingProfileInfo(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/${usuario.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Falha ao salvar info: ${response.status}`);
      }

      const data = await response.json();
      setUsuario((prev) => ({ ...prev, ...data }));
      closeEditProfileModal();
    } catch (error) {
      console.error("Erro ao salvar informaÇðes do perfil", error);
    } finally {
      setIsSavingProfileInfo(false);
    }
  };

  const sortTagsWithInstrumentsFirst = (list = []) => {
    return [...list].sort((a, b) => {
      const aIsInst = Boolean(a?.isInstrument || a?.instrumento_id);
      const bIsInst = Boolean(b?.isInstrument || b?.instrumento_id);
      if (aIsInst === bIsInst) {
        return (a?.name || a?.nome || "").localeCompare(b?.name || b?.nome || "");
      }
      return aIsInst ? -1 : 1;
    });
  };

  const displayTags =
    tags && tags.length > 0
      ? sortTagsWithInstrumentsFirst(tags)
      : sortTagsWithInstrumentsFirst(
        instrumentosProfessor
          .map((instrumento) => {
            const name = instrumento?.nome || instrumento?.tipo;
            if (!name) return null;
            return { name, isInstrument: true };
          })
          .filter(Boolean),
      );

  const handleStartChat = () => {
    const primeiroInstrumento = instrumentosProfessor?.[0];
    navigate("/chat", {
      state: {
        contato: {
          uuid: usuario?.global_uuid || userIdentifier || null,
          nome: nomeUsuario,
          foto: displayedPicture,
          instrumento: primeiroInstrumento?.nome || primeiroInstrumento?.tipo || "",
        },
      },
    });
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    if (usuario.link_aula) {
      window.open(usuario.link_aula, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="profile-page">
      <Header />

      <div className="profile-container">
        <div className="lado-esquerdo-profile">
          <div className="top-items">
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

            {isOwner && (
              <button className="btn-editar-texto" title="Editar textos" onClick={openEditTextsModal}>
                <span aria-hidden="true">✎</span>
              </button>
            )}
          </div>

          <div className="main-text">
            <div className="texto-intro">
              <p>{introText}</p>
            </div>

            <div className="texto-desc">
              <p>{descText}</p>
            </div>
          </div>
        </div>

        <div className="lado-direito-profile">
          <UserCard
            usuario={usuario}
            isOwner={isOwner}
            isProfessor={isProfessor}
            displayedPicture={displayedPicture}
            nomeUsuario={nomeUsuario}
            ratingMedia={ratingMedia}
            ratingTotal={ratingTotal}
            pacotes={pacotes}
            isLoadingPacotes={isLoadingPacotes}
            onPhotoClick={handleFotoClick}
            onEditProfileClick={openEditProfileModal}
            onCreatePackageClick={() => setIsPackageModalOpen(true)}
            onScheduleClassClick={openScheduleModal}
            onEnterClassClick={handleLinkClick}
            onStartChatClick={handleStartChat}
            onEditPackageClick={openEditPackageModal}
            onCarregarPacotes={carregarPacotes}
          />
        </div>

        <ProfilePictureModal
          open={isModalOpen}
          onClose={closeModal}
          displayedPicture={displayedPicture}
          nomeUsuario={nomeUsuario}
          fileInputRef={fileInputRef}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          onSelectFileClick={handleUploadClick}
          onUpload={handleUploadSubmit}
          isUploading={isUploading}
        />

        <EditProfileTextModal
          open={isEditTextsModalOpen}
          onClose={closeEditTextsModal}
          onSave={handleSaveTexts}
          initialIntro={introText}
          initialDesc={descText}
          initialTags={displayTags}
          isSaving={isSavingTexts}
        />
        <EditProfileInfoModal
          open={isEditProfileModalOpen}
          onClose={closeEditProfileModal}
          displayedPicture={displayedPicture}
          nomeUsuario={nomeUsuario}
          isOwner={isOwner}
          onPhotoClick={handleFotoClick}
          initialName={usuario?.nome || ""}
          initialEmail={usuario?.email || ""}
          initialPhone={usuario?.telefone || ""}
          initialBio={usuario?.bio || ""}
          initialLinkAula={usuario?.link_aula || ""}
          onSave={handleSaveProfileInfo}
          isSaving={isSavingProfileInfo}
        />

        <Reviews
          usuario={usuario}
          fotoAbsoluta={displayedPicture}
          perfilAvaliado={{
            id: usuario?.id,
            tipo: usuario?.tipo_usuario || usuario?.tipo || null,
          }}
          currentUser={currentUser}
          onRatingChange={refreshRatingStats}
        />
      </div>

      <ScheduleClassModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        pacotes={pacotes}
        modalidades={modalidades}
        instrumentos={instrumentosProfessor}
        agendamento={agendamento}
        handleChangeAgendamento={handleChangeAgendamento}
        handleConfirmarAgendamento={handleConfirmarAgendamento}
      />

      <CreatePackageModal
        open={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        pacote={pacote}
        onChange={setPacote}
        onSubmit={handleSubmitPacote}
      />

      <EditPackageModal
        open={isEditPackageModalOpen}
        onClose={closeEditPackageModal}
        pacote={editingPacote}
        onChange={setEditingPacote}
        onSubmit={handleEditPacote}
      />

      <ButtonChat />
      <Footer />
    </div>
  );
}

export default ProfileUser;
