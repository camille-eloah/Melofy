import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        color: "#000000",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#000000", fontSize: "8rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
        404
      </h1>

      <h2 style={{ color: "#000000", fontSize: "2rem", marginBottom: "1rem" }}>
        Ops! Página não encontrada
      </h2>

      <p style={{ color: "#000000", fontSize: "1.2rem", maxWidth: "500px", opacity: 0.8 }}>
        O caminho digitado não existe, foi removido ou está temporariamente indisponível.
      </p>

      <button
        onClick={() => navigate("/home")}
        style={{
          marginTop: "2rem",
          padding: "12px 25px",
          backgroundColor: "#000000",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "600",
          color: "#fff",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.opacity = "0.85")}
        onMouseOut={(e) => (e.target.style.opacity = "1")}
      >
        Voltar ao início
      </button>

      <p style={{ marginTop: "2rem", fontSize: "0.9rem", opacity: 0.7 }}>
        Código de erro: 404 · MeloFy
      </p>
    </div>
  );
}
