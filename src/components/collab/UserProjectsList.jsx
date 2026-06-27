// components/collab/UserProjectsList.jsx
import { useNavigate } from "react-router-dom";

export default function UserProjectsList({ projects }) {
  const navigate = useNavigate();

  const openBoard = (projectId) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div>
      <div className="text-base font-bold text-text-primary mb-5 flex items-center gap-2.5 uppercase tracking-wider border-l-[3px] border-accent pl-3">
        📁 My Projects
      </div>
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-card p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-base font-semibold text-text-primary">
                  {project.title}
                </div>
                <div className="text-xs text-text-secondary mt-1">
                  {project.myRole} · {project.techStack.join(", ")}
                </div>
              </div>
              <button
                onClick={() => openBoard(project.id)}
                className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-semibold border border-accent-border text-accent bg-accent-bg cursor-pointer"
              >
                Open Board →
              </button>
            </div>
          </div>
        ))}
        <button
          className="w-full justify-center mt-2 bg-accent-dim border-[1.5px] border-accent-border text-accent px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 transition-all duration-200 hover:bg-accent-bg hover:border-accent hover:-translate-y-px"
          onClick={() => alert("Create new project (form not implemented)")}
        >
          + New Project
        </button>
      </div>
    </div>
  );
}
