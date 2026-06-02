// components/collab/UserProjectsList.jsx
import { useNavigate } from "react-router-dom";

export default function UserProjectsList({ projects }) {
  const navigate = useNavigate();

  const openBoard = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div>
      <div className="section-title">
        <span>📁</span> My Projects
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {projects.map((project) => (
          <div key={project.id} className="card" style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {project.title}
                </div>
                <div
                  style={{ fontSize: 12, color: "var(--txt2)", marginTop: 4 }}
                >
                  {project.myRole} · {project.techStack.join(", ")}
                </div>
              </div>
              <button
                onClick={() => openBoard(project.id)}
                className="badge badge-amethyst"
                style={{ cursor: "pointer" }}
              >
                Open Board →
              </button>
            </div>
          </div>
        ))}
        <button
          className="add-task-btn"
          style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          onClick={() => alert("Create new project (form not implemented)")}
        >
          + New Project
        </button>
      </div>
    </div>
  );
}
