import "./TeacherList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function resolveFoto(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const carregarProfessores = async () => {
      try {
        setLoading(true);
        const resp = await fetch(`${API_BASE_URL}/user/professores`);
        if (!resp.ok) throw new Error("erro_professores");
        const data = await resp.json();

        const enriched = await Promise.all(
          (Array.isArray(data) ? data : []).map(async (prof) => {
            const foto = resolveFoto(
              prof.profile_picture || prof.foto || prof.foto_perfil || ""
            );
            let media = 0;
            let total = 0;
            try {
              const statsResp = await fetch(
                `${API_BASE_URL}/ratings/PROFESSOR/${prof.id}/stats`
              );
              if (statsResp.ok) {
                const stats = await statsResp.json();
                media = Number(stats?.media) || 0;
                total = Number.isFinite(Number(stats?.total)) ? Number(stats.total) : 0;
              }
            } catch (err) {
              /* ignora erro de stats */
            }
            return {
              id: prof.id,
              uuid: prof.global_uuid,
              name: prof.nome,
              city: "Caico - RN",
              instrument: "Professor",
              image: foto,
              rating: media.toFixed(1),
              reviews: `${total} reviews`,
              bio: prof.bio || "Nenhuma bio informada.",
              price: "R$ 90/h",
            };
          })
        );

        setTeachers(enriched);
      } catch (err) {
        console.error("Erro ao carregar professores", err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };

    carregarProfessores();
  }, []);

  return (
    <main className="teacher-list">
      <h2 className="teacher-title">
        Nossa selecao de professores particulares no Brasil
      </h2>

      {loading && <p>Carregando professores...</p>}

      <div className="teacher-grid">
        {teachers.map((t) => (
          <div
            className="teacher-card"
            key={t.id}
            onClick={() => navigate(`/professor/${t.uuid || t.id}`)}
          >
            <div className="teacher-image">
              <img src={t.image || ""} alt={t.name} />
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
                <strong>{t.instrument}</strong> - {t.bio}
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
