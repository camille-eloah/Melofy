import "./ProfileUser.css";
import { Link } from "react-router-dom";
import defaultAvatar from '../../assets/foto-perfil2.jpeg';



function ProfileUser({ usuario = {}, activities = [], currentUser = null }) {
  const nomeUsuario = usuario.nome || "Usuário Desconhecido";
  const profilePicture = usuario.profile_picture || null;

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
            <img
              src={defaultAvatar}
              alt="Avatar padrão"
              className="foto-perfil"
            />
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

          {currentUser?.id === usuario?.id && (
            <div className="botoes">
              <button className="btn-editar">Editar Perfil</button>
              <button className="btn-deletar" >Deletar Conta</button>
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
