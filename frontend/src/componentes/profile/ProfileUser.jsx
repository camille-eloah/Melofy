import './ProfileUser.css';

function ProfileUser({ usuario = {}, activities = [], currentUser = null }) {
  const nomeUsuario = usuario.nome || "Usuário Desconhecido";
  const profilePicture = usuario.profile_picture || null;

  return (
    <div className="profile-container">
      {/* Texto principal à esquerda */}
      <div className="texto-intro">
        <p>
          Mais de 4.000 horas de aulas on-line. Diversas aprovações em concursos
          militares e vestibulares. Meu objetivo é garantir seu entendimento!
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
          <p><strong>Email:</strong> {usuario.email || "Não informado"}</p>
          <p><strong>Bio:</strong> {usuario.bio || "Sem bio"}</p>
          <p><strong>Telefone:</strong> {usuario.telefone || "Não informado"}</p>
        </div>

        {currentUser?.id === usuario?.id && (
          <div className="botoes">
            <button className="btn-editar">Editar Perfil</button>
            <button className="btn-deletar">Deletar Conta</button>
          </div>
        )}
      </div>

      {/* Avaliações abaixo */}
      <div className="avaliacoes">
        <h4>&lt;Avaliações&gt;</h4>
        <div className="box-avaliacao"></div>
      </div>
    </div>
  );
}

export default ProfileUser;
