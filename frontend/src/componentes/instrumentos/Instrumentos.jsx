import "./Instrumentos.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import saxofone from "../../assets/Images-WhiteBackground/saxofone.png";
import guitarra from "../../assets/Images-WhiteBackground/guitarra.png";
import violao from "../../assets/Images-WhiteBackground/violao.png";
import baixo from "../../assets/Images-WhiteBackground/baixo.png";
import flauta from "../../assets/Images-WhiteBackground/flauta.png";
import teclado from "../../assets/Images-WhiteBackground/teclado.png";
import violino from "../../assets/Images-WhiteBackground/violino.png";
import canto from "../../assets/Images-WhiteBackground/canto.png";
import menino from "../../assets/Images-Characters/menino apontando.png";
import partitura from "../../assets/Images-WhiteBackground/partitura.png";
import sanfona from "../../assets/Images-WhiteBackground/sanfona.png";
import Footer from "../layout/Footer";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const INSTRUMENTOS = [
  { id: 1, nome: "Saxofone", img: saxofone },
  { id: 2, nome: "Guitarra", img: guitarra },
  { id: 3, nome: "Violão", img: violao },
  { id: 4, nome: "Flauta", img: flauta },
  { id: 5, nome: "Partitura", img: partitura },
  { id: 6, nome: "Baixo", img: baixo },
  { id: 7, nome: "Violino", img: violino },
  { id: 8, nome: "Canto", img: canto },
  { id: 9, nome: "Teclado", img: teclado },
  { id: 10, nome: "Acordeon", img: sanfona },
];

function Instrumentos() {
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // 🚨 Novo estado que impede o "piscar"
  const [carregandoCheck, setCarregandoCheck] = useState(true);

  // Bloqueio de acesso e checagem de instrumentos
  useEffect(() => {
    const userStr = localStorage.getItem("usuario");

    if (!userStr) {
      navigate("/login", { replace: true });
      return;
    }

    const user = JSON.parse(userStr);

    // Impede aluno de acessar
    if (!user.tipo_usuario || user.tipo_usuario.toLowerCase() !== "professor") {
      navigate("/home", { replace: true });
      return;
    }

    async function checkInstrumentos() {
      try {
        const resp = await fetch(`${API_BASE_URL}/instruments/professor/${user.id}`);

        if (resp.ok) {
          const dados = await resp.json();

          if (Array.isArray(dados) && dados.length > 0) {
            navigate("/home", { replace: true });
            return;
          }
        }
      } catch (err) {
        console.error("Erro ao checar instrumentos:", err);
      } finally {
        // Libera a renderização sem piscar
        setCarregandoCheck(false);
      }
    }

    checkInstrumentos();
  }, []);

  function toggleInstrument(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function salvarInstrumentos() {
    try {
      setLoading(true);
      setMensagem("");

      const user = JSON.parse(localStorage.getItem("usuario"));
      if (!user) throw new Error("Usuário não encontrado");

      const resp = await fetch(`${API_BASE_URL}/instruments/escolher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professor_id: user.id,
          instrumentos_ids: selectedIds,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.detail || "Erro ao salvar instrumentos");
      }

      setMensagem("Instrumentos salvos com sucesso!");

      navigate("/home");
    } catch (err) {
      console.error(err);
      setMensagem("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // 🚨 Impede renderização até terminar a checagem
  if (carregandoCheck) {
    return null; // ou <div>Carregando...</div>
  }

  // 🌟 Renderização normal
  return (
    <div className="instrumentos-page">

      <header className="instrumentos-header">
        <div className="header-left">
          <span className="brand">
            <svg className="brand-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13M9 18l12-2v3L9 21v-3z" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            <span className="brand-text">MELOFY</span>
          </span>
        </div>
      </header>

      <div className="instrumentos-content">
        <h1>Prof.(a), escolha os instrumentos que deseja ensinar!</h1>
        <h2>Estamos quase finalizando seu cadastro...</h2>

        <div className="instrumentos-circles-container">
          {INSTRUMENTOS.slice(0, 5).map((inst) => (
            <div
              key={inst.id}
              className={
                "instrumentos-circle" +
                (selectedIds.includes(inst.id) ? " selecionado" : "")
              }
              onClick={() => toggleInstrument(inst.id)}
            >
              <img src={inst.img} alt={inst.nome} />
              <span className="instrumentos-circle-text">{inst.nome}</span>
            </div>
          ))}
        </div>

        <div className="instrumentos-circles-container">
          {INSTRUMENTOS.slice(5).map((inst) => (
            <div
              key={inst.id}
              className={
                "instrumentos-circle" +
                (selectedIds.includes(inst.id) ? " selecionado" : "")
              }
              onClick={() => toggleInstrument(inst.id)}
            >
              <img src={inst.img} alt={inst.nome} />
              <span className="instrumentos-circle-text">{inst.nome}</span>
            </div>
          ))}

          <img className="menino-instrumento" src={menino} alt="Menino Apontando" />
        </div>

        {mensagem && <p className="mensagem-instrumentos">{mensagem}</p>}
      </div>

      <button
        className="botao-instrumentos"
        onClick={salvarInstrumentos}
        disabled={loading || selectedIds.length === 0}
      >
        {loading ? "Salvando..." : "Salvar instrumentos"}
      </button>

      <Footer />
    </div>
  );
}

export default Instrumentos;
