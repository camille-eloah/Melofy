import "./Reviews.css";
import { useEffect, useState } from "react";

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([
    {
      nome: "Maria Santos",
      foto: "https://via.placeholder.com/40",
      estrelas: 5,
      texto: "Excelente profissional! Explica com paciencia e clareza."
    },
    {
      nome: "Joao Pereira",
      foto: "https://via.placeholder.com/40",
      estrelas: 4,
      texto: "Otimo atendimento, recomendo! A aula foi muito produtiva."
    }
  ]);

  const [novaEstrela, setNovaEstrela] = useState(0);
  const [novoTexto, setNovoTexto] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState({ nome: "", foto: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("usuario");
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      setUsuarioLogado({
        nome: user?.nome || "",
        foto:
          user?.foto ||
          user?.foto_perfil ||
          user?.profile_image ||
          user?.profilePhoto ||
          ""
      });
    } catch (err) {
      console.error("Erro ao ler usuario logado", err);
    }
  }, []);

  function enviarAvaliacao() {
    if (novaEstrela === 0 || !novoTexto.trim()) return;

    const nova = {
      nome: usuarioLogado.nome || "Usuario",
      foto: usuarioLogado.foto || "https://via.placeholder.com/40",
      estrelas: novaEstrela,
      texto: novoTexto
    };

    setAvaliacoes((prev) => [...prev, nova]);

    setNovoTexto("");
    setNovaEstrela(0);
  }

  const nomeExibicao = usuarioLogado.nome || "Usuario";
  const fotoExibicao = usuarioLogado.foto || "https://via.placeholder.com/60";

  return (
    <div className="avaliacoes-container">

      <div className="avaliacao-nova">
        <h3 className="titulo-bloco">Deixe sua avaliacao</h3>

        <div className="usuario-logado">
          <img src={fotoExibicao} alt="foto do usuario logado" />
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
              *
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
            <img src={item.foto} alt="foto usuario" />
            <div className="nome-e-estrelas">
              <span className="nome">{item.nome}</span>
              <span className="estrelas">{"*".repeat(item.estrelas)}</span>
            </div>
          </div>
          <p className="texto">{item.texto}</p>
        </div>
      ))}
    </div>
  );
};

export default Avaliacoes;
