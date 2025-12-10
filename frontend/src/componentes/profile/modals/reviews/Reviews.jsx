import "./Reviews.css";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function resolveFoto(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const Avaliacoes = ({
  usuario: usuarioProp = {},
  fotoAbsoluta = "",
  perfilAvaliado = {},
  currentUser = null,
  onRatingChange = null,
}) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [novaEstrela, setNovaEstrela] = useState(0);
  const [novoTexto, setNovoTexto] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState({ nome: "", foto: "" });
  const [tipoLogado, setTipoLogado] = useState("");
  const [idLogado, setIdLogado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [editando, setEditando] = useState(false);
  const [avaliacaoMinha, setAvaliacaoMinha] = useState(null);

  useEffect(() => {
    // Prioriza o usuario autenticado (prop currentUser); fallback para localStorage
    if (currentUser?.nome) {
      const rawFoto =
        currentUser?.profile_picture ||
        currentUser?.foto ||
        currentUser?.foto_perfil ||
        currentUser?.profile_image ||
        currentUser?.profilePhoto ||
        currentUser?.fotoPerfil ||
        "";
      setUsuarioLogado({
        nome: currentUser.nome,
        foto: rawFoto ? resolveFoto(rawFoto) : "",
      });
      setTipoLogado((currentUser?.tipo_usuario || currentUser?.tipo || "").toString().toUpperCase());
      setIdLogado(currentUser?.id ?? null);
      return;
    }

    const userStr = localStorage.getItem("usuario");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const rawFoto =
        user?.foto ||
        user?.foto_perfil ||
        user?.profile_image ||
        user?.profilePhoto ||
        user?.profile_picture ||
        user?.fotoPerfil ||
        "";
      const resolvedFoto = resolveFoto(rawFoto);

      setUsuarioLogado({
        nome: user?.nome || "",
        foto: resolvedFoto || ""
      });
      setTipoLogado((user?.tipo_usuario || user?.tipo || "").toString().toUpperCase());
      setIdLogado(user?.id ?? null);
    } catch (err) {
      console.error("Erro ao ler usuario logado", err);
    }
  }, [currentUser]);

  useEffect(() => {
    const avaliadoId = perfilAvaliado?.id;
    const avaliadoTipo = (perfilAvaliado?.tipo || "").toString().toUpperCase();
    if (!avaliadoId || !avaliadoTipo) {
      setAvaliacoes([]);
      setJaAvaliou(false);
      return;
    }

    const carregar = async () => {
      try {
        setCarregando(true);
        console.log("[Reviews] carregando avaliacoes", { avaliadoId, avaliadoTipo, perfilAvaliado });
        const resp = await fetch(`${API_BASE_URL}/ratings/${avaliadoTipo}/${avaliadoId}`, {
          credentials: "include",
        });
        if (!resp.ok) {
          console.error("Falha ao carregar avaliacoes", {
            status: resp.status,
            body: await resp.text(),
            avaliadoId,
            avaliadoTipo,
          });
          setAvaliacoes([]);
          return;
        }
        const data = await resp.json();
        const convertidos = Array.isArray(data)
          ? data.map((r) => ({
              autorId: r.autor_id,
              nome: r.autor_nome,
              foto: resolveFoto(r.autor_foto) || "",
              estrelas: r.nota,
              texto: r.texto || "",
            }))
          : [];
        console.log("[Reviews] avaliacoes recebidas", {
          avaliadoId,
          avaliadoTipo,
          total: convertidos.length,
          autores: convertidos.map((c) => c.nome),
        });
        setAvaliacoes(convertidos);
        const minha = idLogado
          ? convertidos.find((c) => String(c.autorId) === String(idLogado))
          : null;
        setAvaliacaoMinha(minha);
        setJaAvaliou(Boolean(minha));
      } catch (err) {
        console.error("Erro ao carregar avaliacoes", err);
        setAvaliacoes([]);
        setJaAvaliou(false);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
    // limpa estado enquanto carrega um novo perfil
    return () => {
      setAvaliacoes([]);
      setJaAvaliou(false);
    };
  }, [perfilAvaliado?.id, perfilAvaliado?.tipo, idLogado]);

  async function enviarAvaliacao() {
    if (novaEstrela === 0 || !novoTexto.trim()) return;

    const avaliadoId = perfilAvaliado?.id;
    const avaliadoTipo = (perfilAvaliado?.tipo || "").toString().toUpperCase();
    if (!avaliadoId || !avaliadoTipo) return;
    if (!editando && tipoLogado && avaliadoTipo && tipoLogado === avaliadoTipo) return;

    try {
      setEnviando(true);
      const payload = {
        avaliado_id: avaliadoId,
        avaliado_tipo: avaliadoTipo,
        nota: novaEstrela,
        texto: novoTexto,
      };
      const url = `${API_BASE_URL}/ratings${editando ? `/${avaliadoTipo}/${avaliadoId}` : ""}`;
      const method = editando ? "PATCH" : "POST";
      console.log("[Reviews] enviando avaliacao", { payload, method, url });
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.detail || "Falha ao enviar avaliacao");
      }
      console.log("[Reviews] avaliacao salva", data);
      const novoOuEditado = {
        id: data.id,
        autorId: data.autor_id,
        nome: data.autor_nome,
        foto: resolveFoto(data.autor_foto) || "",
        estrelas: data.nota,
        texto: data.texto || "",
      };
      setAvaliacoes((prev) => {
        if (editando && avaliacaoMinha) {
          return prev.map((av) =>
            av.autorId && String(av.autorId) === String(avaliacaoMinha.autorId) ? novoOuEditado : av
          );
        }
        return [...prev, novoOuEditado];
      });
      setAvaliacaoMinha(novoOuEditado);
      setNovoTexto("");
      setNovaEstrela(0);
      setJaAvaliou(true);
      setEditando(false);
      if (onRatingChange) {
        onRatingChange();
      }
    } catch (err) {
      console.error("Erro ao enviar avaliacao", err);
    } finally {
      setEnviando(false);
    }
  }

  const nomeExibicao = usuarioLogado.nome || "Usuario";
  const inicialExibicao = (nomeExibicao || "?").trim().charAt(0).toUpperCase() || "?";
  const fotoExibicao = usuarioLogado.foto || "";
  const tipoAvaliado = (perfilAvaliado?.tipo || "").toString().toUpperCase();
  const tiposDiferentes = !tipoLogado || !tipoAvaliado ? true : tipoLogado !== tipoAvaliado;
  const podeAvaliar = tiposDiferentes && (!jaAvaliou || editando);
  const podeEditar = jaAvaliou && tiposDiferentes && !editando;

  const handleCardFotoError = (index) => {
    setAvaliacoes((prev) =>
      prev.map((av, i) => (i === index ? { ...av, foto: "" } : av))
    );
  };

  return (
    <div className="avaliacoes-container">

            {podeEditar && (
        <div className="avaliacao-nova">
          <h3 className="titulo-bloco">Você já avaliou este perfil</h3>
          <p className="texto">Edite sua avaliação existente para atualizar nota ou comentário.</p>
          <button
            className="botao-enviar"
            onClick={() => {
              setEditando(true);
              if (avaliacaoMinha) {
                setNovaEstrela(avaliacaoMinha.estrelas || 0);
                setNovoTexto(avaliacaoMinha.texto || "");
              }
            }}
          >
            Editar
          </button>
        </div>
      )}

      {podeAvaliar && (
        <div className="avaliacao-nova">
          <h3 className="titulo-bloco">Deixe sua avaliacao</h3>

          <div className="usuario-logado">
            {fotoExibicao ? (
              <img
                src={fotoExibicao}
                alt="foto do usuario logado"
                onError={() =>
                  setUsuarioLogado((prev) => ({
                    ...prev,
                    foto: ""
                  }))
                }
              />
            ) : (
              <div className="review-foto-placeholder">{inicialExibicao}</div>
            )}
            <div className="usuario-logado-info">
              <span className="usuario-logado-label">Comentando como</span>
              <span className="usuario-logado-nome">{nomeExibicao}</span>
            </div>
          </div>

          <textarea
            className="novo-input"
            placeholder="Escreva um comentario"
            rows={4}
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
          ></textarea>

          <div className="container-estrelas">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`nova-star ${novaEstrela >= n ? "ativa" : ""}`}
                onClick={() => setNovaEstrela(n)}
              >
                ★
              </span>
            ))}
          </div>

          <button className="botao-enviar" onClick={enviarAvaliacao} disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar avaliacao"}
          </button>
        </div>
      )}

      <h3 className="titulo-lista">Avaliações de usuários</h3>
      {carregando && <p className="texto">Carregando avaliações...</p>}

      {avaliacoes.map((item, i) => (
        <div className="avaliacao-card" key={i}>
          <div className="top">
            {item.foto ? (
              <img
                src={item.foto}
                alt="foto usuario"
                onError={() => handleCardFotoError(i)}
              />
            ) : (
              <div className="review-foto-placeholder">
                {(item.nome || "?").trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="nome-e-estrelas">
              <span className="nome">{item.nome}</span>
              <span className="estrelas">{"★".repeat(item.estrelas)}</span>
            </div>
          </div>
          <p className="texto">{item.texto}</p>
        </div>
      ))}
    </div>
  );
};

export default Avaliacoes;


