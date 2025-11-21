import "./ProfileUser.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ProfileUser({ usuario: usuarioProp = {}, activities = [], currentUser: currentUserProp = null }) {
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { id: userIdParam } = useParams();

  useEffect(() => {
    // se houver um id na rota, buscar o perfil correspondente
    if (!userIdParam) return;

    console.debug("Buscando perfil por id da rota", userIdParam);
    fetch(`${API_BASE_URL}/user/${userIdParam}`)
      .then((res) => {
        console.debug("Resposta /user/:id", res.status);
        if (res.ok) return res.json();
        throw new Error("not_found");
      })
      .then((data) => {
        console.debug("Perfil carregado pela rota", data);
        setUsuario(data);
      })
      .catch((err) => {
        console.debug("Erro ao carregar perfil pela rota", err);
        if (err.message === "not_found") {
          navigate("/home");
        }
      });
  }, [userIdParam, navigate]);

  useEffect(() => {
    console.debug("Buscando usuário logado em /auth/me");
    fetch(`${API_BASE_URL}/auth/me`, { credentials: "include" })
      .then((res) => {
        console.debug("Resposta /auth/me", res.status);
        if (res.ok) return res.json();
        if (res.status === 401) throw new Error("unauthorized");
        throw new Error("erro");
      })
      .then((data) => {
        console.debug("Usuário logado carregado", data);
        setCurrentUser(data || null);
        // se estamos no próprio perfil ou sem id na rota, e ainda não temos usuário, preenche
        if ((!userIdParam || String(userIdParam) === String(data.id)) && !(usuario && usuario.id)) {
          setUsuario(data || {});
        }
      })
      .catch((err) => {
        console.debug("Erro ao carregar /auth/me", err);
        if (err.message === "unauthorized") {
          navigate("/login");
          return;
        }
        // fallback: mantém dados padrão e apenas loga
        console.debug("Não foi possível carregar usuário logado", err);
      });
  }, [navigate, userIdParam]);

  const nomeUsuario = usuario?.nome || "Usuário Desconhecido";
  const profilePicture = usuario?.profile_picture || null;
  const podeEditar = currentUser?.id && usuario?.id && currentUser.id === usuario.id;

  const handleFotoClick = () => {
    if (podeEditar) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="profile-page">
      {/* Cabeçalho azul escuro */}
      <header className="profile-header">
        <div className="profile-header-left">
         
          <span className="brand">MELOFY</span>
        </div>

        <nav className="profile-header-nav">
          <Link to="/home">Tela Inicial</Link>
          <a href="#">Dar aulas</a>
          <a href="#">Conectar</a>
        </nav>
      </header>


      <div className="profile-container">
       {/* Container top-items acima do main-text */}
        <div className="top-items">
          {/* Categorias no início (esquerda) */}
          <div className="categorias">
            <span className="categoria-item">Guitarra</span>
            <span className="categoria-item">Violão</span>
            <span className="categoria-item">Ukulele</span>
          </div>

          {/* Botão de edição no final (direita)*/}
          {podeEditar && (
            <button className="btn-editar-texto" title="Editar textos">
              <span aria-hidden="true">✎</span>
            </button>
          )}
          
        </div>

        {/* Texto principal à esquerda */}
        <div className="main-text">

          <div className="texto-intro">
            <p>
              Aulas totalmente voltadas ao repertório que o aluno quer aprender! Guitarra, Violão e Ukulele. 
            </p>
          </div>

          <div className="texto-desc">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            </p>
          </div>
        </div>

        {/* Cartão de perfil à direita */}
        <div className="card-perfil">
          <div
            className={`foto-wrapper ${podeEditar ? "foto-interativa" : ""}`}
            onClick={handleFotoClick}
            role={podeEditar ? "button" : undefined}
            tabIndex={podeEditar ? 0 : undefined}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFotoClick();
              }
            }}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={`Foto de ${nomeUsuario}`}
                className="foto-perfil"
              />
            ) : (
              <div className="foto-vazia">
                {nomeUsuario[0]?.toUpperCase() || "?"}
              </div>
            )}
            {podeEditar && (
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
          <p className="avaliacao">&lt;Avaliação&gt;</p>

          <div className="info">
            <p>
              <span>Email:</span>
              <span>{usuario.email || "Não informado"}</span>
            </p>
            <p>
              <span>Telefone:</span>
              <span>{usuario.telefone || "Não informado"}</span>
            </p>
            <p className="bio-text">
              {usuario.bio || "Nenhuma descrição informada."}
            </p>

          </div>

          {podeEditar && (
            <div className="botoes">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-deletar">Deletar Conta</button>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Pré-visualização da foto de perfil"
            >
              <div className="modal-header">
                <h5>Pré-visualização</h5>
                <button className="modal-close" onClick={closeModal} aria-label="Fechar modal">
                  x
                </button>
              </div>
              <div className="modal-body">
                {profilePicture ? (
                  <img src={profilePicture} alt={`Pré-visualização de ${nomeUsuario}`} />
                ) : (
                  <div className="modal-placeholder">{nomeUsuario[0]?.toUpperCase() || "?"}</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-upload" type="button">
                  Fazer upload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Avaliações abaixo */}
        <div className="avaliacoes">
          <h4>&lt;Avaliações&gt;</h4>
          <div className="box-avaliacao avaliacao-card">
            <span className="star">★</span>
            <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
              venenatis, ligula sit amet efficitur maximus, purus ligula viverra
              eros, eu pellentesque.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUser;
