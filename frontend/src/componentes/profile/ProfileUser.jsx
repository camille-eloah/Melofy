import "./ProfileUser.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function ProfileUser({ usuario: usuarioProp = {}, activities = [], currentUser: currentUserProp = null }) {
  const [usuario, setUsuario] = useState(usuarioProp || {});
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
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
        {/* Texto principal à esquerda */}
        <div className="texto-intro">
          <p>
            Mais de 4.000 horas de aulas on-line. Diversas aprovações em
            concursos militares e vestibulares. Meu objetivo é garantir seu
            entendimento!
          </p>
        </div>

        {/* Cartão de perfil à direita */}
        <div className="card-perfil">
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

          <h3>{nomeUsuario}</h3>
          <p className="avaliacao">&lt;Avaliação&gt;</p>

          <div className="info">
            <p>
              <span>Email:</span>
              <span>{usuario.email || "Não informado"}</span>
            </p>
            <p>
              <span>Bio:</span>
              <span>{usuario.bio || "Sem bio"}</span>
            </p>
            <p>
              <span>Telefone:</span>
              <span>{usuario.telefone || "Não informado"}</span>
            </p>
          </div>

          {podeEditar && (
            <div className="botoes">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-deletar">Deletar Conta</button>
            </div>
          )}
        </div>

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
