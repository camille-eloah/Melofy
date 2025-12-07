import "./Reviews.css";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function resolveFoto(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

const Avaliacoes = ({ usuario: usuarioProp = {}, fotoAbsoluta = "" }) => {
  const [avaliacoes, setAvaliacoes] = useState([
    {
      nome: "Maria Santos",
      foto: "",
      estrelas: 5,
      texto: "Excelente profissional! Explica com paciencia e clareza."
    },
    {
      nome: "Joao Pereira",
      foto: "",
      estrelas: 4,
      texto: "Otimo atendimento, recomendo! A aula foi muito produtiva."
    }
  ]);

  const [novaEstrela, setNovaEstrela] = useState(0);
  const [novoTexto, setNovoTexto] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState({ nome: "", foto: "" });

  useEffect(() => {
    // Prioriza os dados vindos via props (perfil carregado em ProfileUser)
    const inicialProp = (usuarioProp?.nome || "?").trim().charAt(0).toUpperCase() || "?";
    const rawFotoProp =
      fotoAbsoluta ||
      usuarioProp?.profile_picture ||
      usuarioProp?.foto ||
      usuarioProp?.foto_perfil ||
      usuarioProp?.profile_image ||
      usuarioProp?.profilePhoto ||
      usuarioProp?.fotoPerfil ||
      "";
    if (usuarioProp?.nome || rawFotoProp) {
      setUsuarioLogado({
        nome: usuarioProp?.nome || "",
        foto: rawFotoProp ? resolveFoto(rawFotoProp) : ""
      });
      console.log("[Reviews] usuario via props", {
        usuarioProp,
        rawFotoProp,
        fotoAbsoluta,
        inicial: inicialProp
      });
      return;
    }

    const userStr = localStorage.getItem("usuario");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      const inicial = (user?.nome || "?").trim().charAt(0).toUpperCase() || "?";
      const rawFoto =
        user?.foto ||
        user?.foto_perfil ||
        user?.profile_image ||
        user?.profilePhoto ||
        user?.profile_picture ||
        user?.fotoPerfil ||
        "";
      const resolvedFoto = resolveFoto(rawFoto);

      if (!rawFoto) {
        console.log("[Reviews] usuario sem foto no localStorage; usando inicial", {
          user,
          rawFoto,
          resolvedFoto,
          inicial
        });
      } else {
        console.log("[Reviews] usuario localStorage", { user, rawFoto, resolvedFoto });
      }

      setUsuarioLogado({
        nome: user?.nome || "",
        foto: resolvedFoto || ""
      });
    } catch (err) {
      console.error("Erro ao ler usuario logado", err);
    }
  }, [usuarioProp, fotoAbsoluta]);

  function enviarAvaliacao() {
    if (novaEstrela === 0 || !novoTexto.trim()) return;

    const nova = {
      nome: usuarioLogado.nome || "Usuario",
      foto: usuarioLogado.foto || "",
      estrelas: novaEstrela,
      texto: novoTexto
    };

    setAvaliacoes((prev) => [...prev, nova]);

    setNovoTexto("");
    setNovaEstrela(0);
  }

  const nomeExibicao = usuarioLogado.nome || "Usuario";
  const inicialExibicao = (nomeExibicao || "?").trim().charAt(0).toUpperCase() || "?";
  const fotoExibicao = usuarioLogado.foto || "";

  const handleCardFotoError = (index) => {
    setAvaliacoes((prev) =>
      prev.map((av, i) => (i === index ? { ...av, foto: "" } : av))
    );
  };

  return (
    <div className="avaliacoes-container">

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

        <button className="botao-enviar" onClick={enviarAvaliacao}>
          Enviar avaliacao
        </button>
      </div>

      <h3 className="titulo-lista">Avaliacoes de usuarios</h3>

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
