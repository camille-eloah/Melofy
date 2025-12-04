import "./TeacherList.css";
import { useState, useEffect } from "react";

function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchProfessor() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/professor/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeachers([data]); // transforma em array para usar map
    } catch (err) {
      console.error(err);
    }
  }

  fetchProfessor();
}, []);

  return (
    <main className="teacher-list">
      <h2 className="teacher-title">
        Nossa seleção de professores particulares no Brasil
      </h2>

      <div className="teacher-grid">
        {teachers.map((t) => (
          <div className="teacher-card" key={t.id}>
            
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
