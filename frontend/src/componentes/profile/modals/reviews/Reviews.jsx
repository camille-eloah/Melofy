import "./Reviews.css";
import { useState } from "react";

const Avaliacoes = () => {
  const [avaliacoes, setAvaliacoes] = useState([
    {
      nome: "Maria Santos",
      foto: "https://via.placeholder.com/40",
      estrelas: 5,
      texto: "Excelente profissional! Explica com paciência e clareza."
    },
    {
      nome: "João Pereira",
      foto: "https://via.placeholder.com/40",
      estrelas: 4,
      texto: "Ótimo atendimento, recomendo! A aula foi muito produtiva."
    }
  ]);

  const [novaNome, setNovaNome] = useState("");
  const [novaEstrela, setNovaEstrela] = useState(0);
  const [novoTexto, setNovoTexto] = useState("");

  function enviarAvaliacao() {
    if (!novaNome.trim() || novaEstrela === 0 || !novoTexto.trim()) return;

    const nova = {
      nome: novaNome,
      foto: "https://via.placeholder.com/40",
      estrelas: novaEstrela,
      texto: novoTexto
    };

    setAvaliacoes((prev) => [...prev, nova]);

    setNovaNome("");
    setNovoTexto("");
    setNovaEstrela(0);
  }

  return (
    <div className="avaliacoes-container">

      <div className="avaliacao-nova">
        <h3 className="titulo-bloco">Deixe sua avaliação</h3>

        <input
          className="novo-input"
          placeholder="Seu nome"
          value={novaNome}
          onChange={(e) => setNovaNome(e.target.value)}
        />

        <textarea
          className="novo-input"
          placeholder="Escreva um comentário"
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
          Enviar avaliação
        </button>
      </div>

      <h3 className="titulo-lista">Avaliações de usuários</h3>

      {avaliacoes.map((item, i) => (
        <div className="avaliacao-card" key={i}>
          <div className="top">
            <img src={item.foto} alt="foto usuário" />
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
