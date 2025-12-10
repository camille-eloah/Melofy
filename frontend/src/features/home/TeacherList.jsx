import "./TeacherList.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function resolveFoto(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatInstruments(list) {
  const arr = (list || []).filter(Boolean);
  if (arr.length === 0) return "Instrumentos não informados";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} e ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")} e ${arr[arr.length - 1]}`;
}

function TeacherList({ searchTerm = "" }) {
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
            let instrumentosNomes = [];
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
            try {
              const instResp = await fetch(`${API_BASE_URL}/instruments/professor/${prof.id}`);
              if (instResp.ok) {
                const inst = await instResp.json();
                instrumentosNomes = Array.isArray(inst) ? inst.map((i) => i.nome).filter(Boolean) : [];
              }
            } catch (err) {
              /* ignora erro de instrumentos */
            }

            // Buscar modalidades ativas do professor
            let modalidades = [];
            try {
              console.log(`[TeacherList] Buscando configurações do professor ID: ${prof.id}`);
              const configResp = await fetch(`${API_BASE_URL}/professor/${prof.id}/configuracoes`);
              console.log(`[TeacherList] Status da resposta: ${configResp.status}`);
              
              if (configResp.ok) {
                const config = await configResp.json();
                console.log(`[TeacherList] Configurações recebidas:`, config);
                
                if (config.config_remota?.ativo) {
                  console.log(`[TeacherList] Remota ativa`);
                  modalidades.push("remoto");
                }
                if (config.config_presencial?.ativo) {
                  console.log(`[TeacherList] Presencial ativa`);
                  modalidades.push("presencial");
                }
                if (config.config_domicilio?.ativo) {
                  console.log(`[TeacherList] Domicílio ativa`);
                  modalidades.push("domicílio");
                }
                console.log(`[TeacherList] Modalidades encontradas:`, modalidades);
              } else {
                console.warn(`[TeacherList] Erro ao buscar configurações: ${configResp.status}`);
              }
            } catch (err) {
              console.error(`[TeacherList] Erro ao buscar configurações:`, err);
              /* ignora erro de configurações */
            }

            // Formatar modalidades para exibição
            const formatModalidades = (list) => {
              if (list.length === 0) return "";
              if (list.length === 1) return list[0];
              if (list.length === 2) return `${list[0]} & ${list[1]}`;
              return `${list.slice(0, -1).join(", ")} & ${list[list.length - 1]}`;
            };

            // Formatar cidade e estado dinamicamente
            const cidade = prof.cidade || "Cidade não informada";
            const estado = prof.estado || "";
            const location = estado ? `${cidade} - ${estado}` : cidade;
            const modalidadesText = modalidades.length > 0 ? ` (${formatModalidades(modalidades)})` : "";
            
            console.log(`[TeacherList] Professor ${prof.nome}:`);
            console.log(`  - Localização: ${location}`);
            console.log(`  - Modalidades: ${modalidadesText}`);
            console.log(`  - Texto final: ${location}${modalidadesText}`);

            return {
              id: prof.id,
              uuid: prof.global_uuid,
              name: prof.nome,
              city: location,
              modalidades: modalidadesText,
              instrument: formatInstruments(instrumentosNomes),
              image: foto,
              rating: media.toFixed(1),
              reviews: `${total} reviews`,
              bio: prof.bio || "Nenhuma bio informada.",
              price: "R$ 90/h",
              instrumentosNomes,
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

  const termo = (searchTerm || "").trim().toLowerCase();
  const visiveis =
    termo.length === 0
      ? teachers
      : teachers.filter((t) =>
          (t.instrumentosNomes || []).some((inst) =>
            inst.toLowerCase().includes(termo)
          )
        );

  return (
    <main className="teacher-list">
      <h2 className="teacher-title">
        Nossa selecao de professores particulares no Brasil
      </h2>

      {loading && <p>Carregando professores...</p>}

      <div className="teacher-grid">
        {visiveis.map((t) => {
          console.log(`[TeacherList RENDER] Professor: ${t.name}, City: ${t.city}, Modalidades: ${t.modalidades}`);
          return (
          <div
            className="teacher-card"
            key={t.id}
            onClick={() => navigate(`/professor/${t.uuid || t.id}`)}
          >
            <div className="teacher-image">
              {t.image ? (
                <img src={t.image} alt={t.name} />
              ) : (
                <div className="teacher-placeholder">
                  {t.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            <div className="teacher-info">
              <h3>{t.name}</h3>

              <p className="teacher-location">
                {t.city}{t.modalidades}
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
        )})}
      </div>
    </main>
  );
}

export default TeacherList;
