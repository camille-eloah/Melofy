import "./TeacherList.css";

function FeaturedTeachers() {
  return (
    <div className="teachers-section teachers-section-white">
      <h3>Professores em Destaque</h3>
      <p>Aprenda com especialistas renomados</p>

      <div className="teachers-grid">
        <div className="teacher-card">
          <div className="teacher-avatar" style={{ background: "linear-gradient(135deg, #4285f4, #34a853)" }}>
            JS
          </div>
          <h4>João Silva</h4>
          <p>Especialista em Guitarra</p>
          <span className="teacher-rating">⭐ 4.9</span>
          <div className="teacher-stats">
            <span>2.5k alunos</span>
            <span>•</span>
            <span>120 aulas</span>
          </div>
        </div>

        <div className="teacher-card">
          <div className="teacher-avatar" style={{ background: "linear-gradient(135deg, #ea4335, #fbbc05)" }}>
            MA
          </div>
          <h4>Maria Andrade</h4>
          <p>Professora de Piano</p>
          <span className="teacher-rating">⭐ 4.8</span>
          <div className="teacher-stats">
            <span>1.8k alunos</span>
            <span>•</span>
            <span>95 aulas</span>
          </div>
        </div>

        <div className="teacher-card">
          <div className="teacher-avatar" style={{ background: "linear-gradient(135deg, #34a853, #4285f4)" }}>
            PC
          </div>
          <h4>Pedro Costa</h4>
          <p>Mestre em Violino</p>
          <span className="teacher-rating">⭐ 4.9</span>
          <div className="teacher-stats">
            <span>1.2k alunos</span>
            <span>•</span>
            <span>80 aulas</span>
          </div>
        </div>

        <div className="teacher-card">
          <div className="teacher-avatar" style={{ background: "linear-gradient(135deg, #fbbc05, #ea4335)" }}>
            AF
          </div>
          <h4>Ana Ferreira</h4>
          <p>Coach Vocal</p>
          <span className="teacher-rating">⭐ 4.7</span>
          <div className="teacher-stats">
            <span>3.1k alunos</span>
            <span>•</span>
            <span>150 aulas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturedTeachers;
