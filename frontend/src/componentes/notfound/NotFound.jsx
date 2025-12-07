import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="music-elements">
        <div className="note note-1">♫</div>
        <div className="note note-2">♪</div>
        <div className="note note-3">♩</div>
        <div className="note note-4">♬</div>
      </div>
      
      <div className="content">
        <div className="title-wrapper">
          <h1 className="title">404</h1>
          <div className="equalizer">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
            <div className="bar bar-4"></div>
            <div className="bar bar-5"></div>
          </div>
        </div>

        <h2 className="subtitle">Ops! Página não encontrada</h2>

        <p className="description">
          Parece que essa música ainda não foi composta. A melodia que você busca está em outro lugar.
        </p>

        <button
          onClick={() => navigate("/home")}
          className="back-button"
        >
          Voltar ao início
        </button>

        <p className="footer">
          Código de erro: 404 · MeloFy
        </p>
      </div>
    </div>
  );
}