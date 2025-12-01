import "./TeacherList.css";

import guitarraImg from "../../assets/Images-MainSection/guitarra.png";
import violaoImg from "../../assets/Images-MainSection/violao.png";
import saxImg from "../../assets/Images-MainSection/saxofone.png";
import cantoImg from "../../assets/Images-MainSection/canto.png";

function TeacherList() {
  const teachers = [
    {
      id: 1,
      name: "Aline Castro",
      city: "Natal - RN",
      instrument: "Violão",
      image: violaoImg,
      rating: 4.9,
      reviews: "1.245 avaliações",
      bio: "Metodologia prática e personalizada. Mais de 8 anos de experiência ensinando iniciantes.",
      price: "R$ 60/h",
    },
    {
      id: 2,
      name: "Thiago Moura",
      city: "São Paulo - SP",
      instrument: "Guitarra",
      image: guitarraImg,
      rating: 5.0,
      reviews: "2.870 avaliações",
      bio: "Aulas dinâmicas, com foco em repertório. Ensina rock, blues e fingerstyle.",
      price: "R$ 75/h",
    },
    {
      id: 3,
      name: "Camila Duarte",
      city: "Curitiba - PR",
      instrument: "Canto",
      image: cantoImg,
      rating: 4.7,
      reviews: "980 avaliações",
      bio: "Técnica vocal moderna. Auxilia no controle da respiração e postura.",
      price: "R$ 90/h",
    },
    {
      id: 4,
      name: "Rafael Nunes",
      city: "Recife - PE",
      instrument: "Saxofone",
      image: saxImg,
      rating: 4.8,
      reviews: "1.560 avaliações",
      bio: "Método estruturado para quem quer dominar teoria e improvisação.",
      price: "R$ 120/h",
    },
    {
      id: 5,
      name: "Fernanda Lopes",
      city: "Belo Horizonte - MG",
      instrument: "Canto",
      image: cantoImg,
      rating: 5.0,
      reviews: "3.102 avaliações",
      bio: "Aulas acolhedoras e divertidas, indicadas para iniciantes e níveis avançados.",
      price: "R$ 85/h",
    },
    {
      id: 6,
      name: "Lucas Andrade",
      city: "Rio de Janeiro - RJ",
      instrument: "Violão",
      image: violaoImg,
      rating: 4.6,
      reviews: "743 avaliações",
      bio: "Metodologia moderna voltada ao MPB, sertanejo e repertório popular.",
      price: "R$ 55/h",
    },
  ];

  return (
    <main className="teacher-list">
      <h2 className="teacher-title">
        Nossa seleção de professores particulares no Brasil
      </h2>

      <div className="teacher-grid">
        {teachers.map((t) => (
          <div className="teacher-card" key={t.id}>

            {/* IMAGEM CERTA — PERFEITA, PROPORCIONAL */}
            <div className="teacher-image">
              <img src={t.image} alt={t.name} />
            </div>

            <div className="teacher-info">
              <h3>{t.name}</h3>

              <p className="teacher-location">
                {t.city} (presencial & online)
              </p>

              <p className="teacher-rating">
                ⭐ {t.rating} <span>({t.reviews})</span>
              </p>

              <p className="teacher-description">
                <strong>{t.instrument}</strong> • {t.bio}
              </p>

              <p className="teacher-price">{t.price}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default TeacherList;
