// src/components/profile/Project.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit3, Trash2,  GitBranch, Users,
  X, Loader2, FolderGit2, Link2,  Briefcase, Search,
  Filter, ChevronDown, Star, Clock, CheckCircle, PauseCircle,
  AlertCircle, Eye, Globe,  Tag, ArrowUpRight, MoreHorizontal,
  Calendar, TrendingUp, Layers,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axiosInstance";
import { DOMAINS } from "../../data/mockPosts";
import { confirm } from "../ui/ConfirmDialog";

/* ─────────────────────────── HELPERS ─────────────────────────── */
const domainColor  = (k) => DOMAINS.find((d) => d.value === k)?.color  ?? "#ff5c35";
const domainLabel  = (k) => DOMAINS.find((d) => d.value === k)?.label  ?? k;

const STATUS = {
  ongoing:   { label: "Ongoing",               icon: Clock,         bg: "rgba(245,158,11,.12)",  color: "#d97706" },
  completed: { label: "Completed",              icon: CheckCircle,   bg: "rgba(34,197,94,.12)",   color: "#16a34a" },
  paused:    { label: "Paused",                 icon: PauseCircle,   bg: "rgba(107,114,128,.12)", color: "#6b7280" },
  seeking:   { label: "Seeking Collaborators",  icon: Users,         bg: "rgba(8,145,178,.12)",   color: "#0891b2" },
};

const FILTERS = [
  { value: "all",       label: "All Projects" },
  { value: "ongoing",   label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "paused",    label: "Paused" },
  { value: "seeking",   label: "Seeking Collaborators" },
];

/* inline style primitives */
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: "10px",
  border: "1.5px solid var(--border)", background: "var(--input-bg)",
  fontSize: "14px", color: "var(--text-primary)", outline: "none",
  boxSizing: "border-box",
};
const labelStyle = {
  fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)",
  display: "block", marginBottom: "5px", letterSpacing: ".3px",
};
const tagStyle = (color) => ({
  display: "inline-flex", alignItems: "center", gap: "4px",
  padding: "3px 10px", borderRadius: "16px", fontSize: "11px",
  background: `${color}18`, color: color, border: `1px solid ${color}30`,
  fontWeight: "600",
});

/* ─────────────────────────── SUB: STATUS BADGE ─────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.ongoing;
  const Icon = s.icon;
  return (
    <span style={{ ...tagStyle(s.color), background: s.bg }}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

/* ─────────────────────────── SUB: PROJECT CARD ─────────────────────────── */
function ProjectCard({ project, isOwner, onEdit, onDelete, onView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dc = domainColor(project.domain);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .96 }}
      onClick={() => onView(project)}
      style={{
        background: "var(--card-bg)", border: "1px solid var(--card-border)",
        borderRadius: "14px", padding: "20px", display: "flex",
        flexDirection: "column", gap: "12px", cursor: "pointer",
        position: "relative", transition: "border-color .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = dc; e.currentTarget.style.boxShadow = `0 0 0 1px ${dc}30, 0 8px 24px rgba(0,0,0,.18)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Domain accent strip */}
      <div style={{ position: "absolute", top: 0, left: "20px", right: "20px", height: "2px", background: `linear-gradient(90deg, ${dc}, transparent)`, borderRadius: "0 0 4px 4px" }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.projectName || project.title}
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
            <span style={tagStyle(dc)}>{domainLabel(project.domain)}</span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {isOwner && (
          <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{ padding: "6px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <MoreHorizontal size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: .92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .92 }}
                  style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "10px", padding: "6px", zIndex: 50, minWidth: "130px", boxShadow: "0 8px 24px rgba(0,0,0,.3)" }}
                >
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", borderRadius: "7px", border: "none", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "13px" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project._id); }} style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "8px 10px", borderRadius: "7px", border: "none", background: "transparent", color: "#dc2626", cursor: "pointer", fontSize: "13px" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Tagline */}
      {project.title && project.projectName && project.title !== project.projectName && (
        <p style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", marginTop: "-6px" }}>{project.title}</p>
      )}

      {/* Description */}
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.55" }}>
        {project.description?.slice(0, 130)}{project.description?.length > 130 ? "…" : ""}
      </p>

      {/* Tech Stack */}
      {project.techStack?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {project.techStack.slice(0, 5).map((t) => (
            <span key={t} style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "10px", background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)", fontFamily: "var(--mono, monospace)", fontWeight: "600" }}>{t}</span>
          ))}
          {project.techStack.length > 5 && (
            <span style={{ padding: "2px 8px", borderRadius: "5px", fontSize: "10px", color: "var(--text-muted)" }}>+{project.techStack.length - 5}</span>
          )}
        </div>
      )}

      {/* Roles Needed */}
      {project.rolesNeeded?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".5px" }}>Need:</span>
          {project.rolesNeeded.slice(0, 3).map((r) => (
            <span key={r} style={{ ...tagStyle("#0891b2"), background: "rgba(8,145,178,.1)", fontSize: "10px" }}>{r}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginTop: "2px", paddingTop: "10px", borderTop: "1px solid var(--card-border)" }}>
        {project.myRole && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Briefcase size={11} /> {project.myRole}
          </span>
        )}
        {project.teamMembers?.length > 0 && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
            <Users size={11} /> {project.teamMembers.length} member{project.teamMembers.length > 1 ? "s" : ""}
          </span>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {project.githubRepoURL && (
            <a href={project.githubRepoURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", textDecoration: "none", padding: "3px 7px", borderRadius: "6px", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <GitBranch size={11} /> Repo
            </a>
          )}
          {project.liveDemoURL && (
            <a href={project.liveDemoURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              style={{ color: "var(--text-muted)", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", textDecoration: "none", padding: "3px 7px", borderRadius: "6px", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = dc; e.currentTarget.style.color = dc; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              <ArrowUpRight size={11} /> Demo
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── SUB: FILTER BAR ─────────────────────────── */
function FilterBar({ filter, setFilter, search, setSearch, count }) {
  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
      {/* Search */}
      <div style={{ position: "relative", flex: "1", minWidth: "180px" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          style={{ ...inputStyle, paddingLeft: "34px", fontSize: "13px", padding: "8px 14px 8px 34px" }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", background: "var(--surface-2)", borderRadius: "10px", padding: "4px", flexWrap: "wrap" }}>
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: "5px 12px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600",
              background: filter === f.value ? "var(--card-bg)" : "transparent",
              color: filter === f.value ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: filter === f.value ? "0 1px 4px rgba(0,0,0,.15)" : "none",
              transition: "all .15s",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── SUB: EMPTY STATE ─────────────────────────── */
function EmptyState({ filter, isOwner, onAdd }) {
  const isFiltered = filter !== "all";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <FolderGit2 size={28} color="var(--text-muted)" />
      </div>
      <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
        {isFiltered ? `No ${filter} projects` : "No projects yet"}
      </p>
      <p style={{ fontSize: "13px", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto 20px", lineHeight: "1.5" }}>
        {isFiltered
          ? "Try a different filter or add a new project."
          : isOwner
            ? "Showcase your work — add your first project to build your portfolio."
            : "This user hasn't added any projects yet."}
      </p>
      {isOwner && (
        <button onClick={onAdd} style={{ padding: "10px 22px", borderRadius: "10px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Add Project
        </button>
      )}
    </motion.div>
  );
}

/* ─────────────────────────── SUB: TAG INPUT ─────────────────────────── */
function TagInput({ label, values, onAdd, onRemove, placeholder, color = "var(--accent)", colorBg = "var(--accent-bg)" }) {
  const [val, setVal] = useState("");
  const add = () => { if (val.trim()) { onAdd(val.trim()); setVal(""); } };
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {values.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "7px" }}>
          {values.map((v) => (
            <span key={v} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "16px", fontSize: "11px", background: colorBg, color: color, border: `1px solid ${color}30` }}>
              {v}
              <button onClick={() => onRemove(v)} style={{ background: "none", border: "none", cursor: "pointer", color: color, padding: "0", fontSize: "13px", lineHeight: 1, display: "flex" }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px" }}>
        <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder}
          style={{ ...inputStyle, fontSize: "13px", padding: "8px 12px" }} />
        <button onClick={add} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: color, color: "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── SUB: PROJECT FORM ─────────────────────────── */
const EMPTY_FORM = {
  projectName: "", title: "", description: "", domain: "webdev",
  status: "ongoing", techStack: [], rolesNeeded: [], myRole: "",
  myContributions: "", githubRepoURL: "", liveDemoURL: "", designFilesURL: "",
  teamMembers: [],
};

function ProjectForm({ project, onSave, onCancel, isEditing }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("basics");

  useEffect(() => {
    if (project) {
      setForm({
        projectName: project.projectName || project.title || "",
        title: project.title || "",
        description: project.description || "",
        domain: project.domain || "webdev",
        status: project.status || "ongoing",
        techStack: project.techStack || [],
        rolesNeeded: project.rolesNeeded || [],
        myRole: project.myRole || "",
        myContributions: project.myContributions || "",
        githubRepoURL: project.githubRepoURL || "",
        liveDemoURL: project.liveDemoURL || "",
        designFilesURL: project.designFilesURL || "",
        teamMembers: project.teamMembers || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setActiveTab("basics");
    setError("");
  }, [project]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const addTag = (key, val) => setForm((f) => ({ ...f, [key]: [...f[key], val] }));
  const removeTag = (key, val) => setForm((f) => ({ ...f, [key]: f[key].filter((v) => v !== val) }));

  const handleSubmit = async () => {
    if (!form.projectName.trim()) { setError("Project name is required."); setActiveTab("basics"); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (project?._id) payload._id = project._id;
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "basics",  label: "Basics" },
    { id: "tech",    label: "Tech & Roles" },
    { id: "contrib", label: "My Contribution" },
    { id: "links",   label: "Links & Team" },
  ];

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "18px", width: "min(620px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 30px 60px rgba(0,0,0,.5)" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>{isEditing ? "Edit Project" : "Add New Project"}</h2>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Showcase your work on DevEcosystem</p>
        </div>
        <button onClick={onCancel} style={{ background: "var(--surface-2)", border: "none", borderRadius: "8px", padding: "7px", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
          <X size={16} />
        </button>
      </div>

      {/* Form Tabs */}
      <div style={{ display: "flex", gap: 0, padding: "14px 24px 0", borderBottom: "1px solid var(--card-border)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "7px 14px", border: "none", background: "transparent", cursor: "pointer",
            fontSize: "12px", fontWeight: "600",
            color: activeTab === t.id ? "var(--accent)" : "var(--text-muted)",
            borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            marginBottom: "-1px", transition: "all .15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <AnimatePresence mode="wait">
          {activeTab === "basics" && (
            <motion.div key="basics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Project Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="e.g., DevEcosystem Frontend" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tagline / Subtitle</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="A one-liner about the project" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this project do? What problem does it solve?" rows={5}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Domain</label>
                  <select value={form.domain} onChange={(e) => set("domain", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="seeking">Seeking Collaborators</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "tech" && (
            <motion.div key="tech" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <TagInput
                label="Tech Stack"
                values={form.techStack}
                onAdd={(v) => addTag("techStack", v)}
                onRemove={(v) => removeTag("techStack", v)}
                placeholder="e.g., React, Node.js, PostgreSQL"
                color="var(--accent)"
                colorBg="var(--accent-bg)"
              />
              <TagInput
                label="Roles Needed"
                values={form.rolesNeeded}
                onAdd={(v) => addTag("rolesNeeded", v)}
                onRemove={(v) => removeTag("rolesNeeded", v)}
                placeholder="e.g., Frontend Dev, UI/UX Designer"
                color="#0891b2"
                colorBg="rgba(8,145,178,.1)"
              />
              <div>
                <label style={labelStyle}>Your Role in this Project</label>
                <input value={form.myRole} onChange={(e) => set("myRole", e.target.value)} placeholder="e.g., Lead Frontend Developer" style={inputStyle} />
              </div>
            </motion.div>
          )}

          {activeTab === "contrib" && (
            <motion.div key="contrib" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(8,145,178,.08)", border: "1px solid rgba(8,145,178,.2)", fontSize: "12px", color: "#0891b2", lineHeight: "1.5" }}>
                <strong>Tip:</strong> Detailed contributions feed your Contribution Score and prove real skills to collaborators and recruiters.
              </div>
              <div>
                <label style={labelStyle}>My Contributions</label>
                <textarea value={form.myContributions} onChange={(e) => set("myContributions", e.target.value)}
                  placeholder="Describe what you built, features you implemented, decisions you made, challenges you solved…"
                  rows={7} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: "1.55" }} />
              </div>
            </motion.div>
          )}

          {activeTab === "links" && (
            <motion.div key="links" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={labelStyle}><GitBranch size={11} style={{ display: "inline", marginRight: "4px" }} />GitHub Repo URL</label>
                <input type="url" value={form.githubRepoURL} onChange={(e) => set("githubRepoURL", e.target.value)} placeholder="https://github.com/username/repo" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><Globe size={11} style={{ display: "inline", marginRight: "4px" }} />Live Demo URL</label>
                <input type="url" value={form.liveDemoURL} onChange={(e) => set("liveDemoURL", e.target.value)} placeholder="https://yourproject.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}><Link2 size={11} style={{ display: "inline", marginRight: "4px" }} />Design Files URL (Figma, etc.)</label>
                <input type="url" value={form.designFilesURL} onChange={(e) => set("designFilesURL", e.target.value)} placeholder="https://figma.com/file/..." style={inputStyle} />
              </div>
              <TagInput
                label="Team Members (usernames)"
                values={form.teamMembers}
                onAdd={(v) => addTag("teamMembers", v)}
                onRemove={(v) => removeTag("teamMembers", v)}
                placeholder="Add username and press Enter"
                color="var(--text-secondary)"
                colorBg="var(--surface-2)"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          {error && (
            <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", color: "#dc2626", fontSize: "12px" }}>
              {error}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
          <button onClick={onCancel} style={{ padding: "9px 20px", borderRadius: "10px", border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ padding: "9px 22px", borderRadius: "10px", border: "none", background: saving ? "var(--surface-2)" : "var(--accent)", color: saving ? "var(--text-muted)" : "#fff", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin .8s linear infinite" }} /> : null}
            {saving ? "Saving…" : isEditing ? "Update Project" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SUB: PROJECT DETAIL DRAWER ─────────────────────────── */
function ProjectDetail({ project, onClose, isOwner, onEdit }) {
  if (!project) return null;
  const dc = domainColor(project.domain);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", justifyContent: "flex-end" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(520px, 100vw)", height: "100%", background: "var(--card-bg)", borderLeft: "1px solid var(--card-border)", overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        {/* Accent */}
        <div style={{ height: "3px", background: `linear-gradient(90deg, ${dc}, ${dc}44)` }} />

        {/* Header */}
        <div style={{ padding: "24px", borderBottom: "1px solid var(--card-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span style={tagStyle(dc)}>{domainLabel(project.domain)}</span>
              <StatusBadge status={project.status} />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {isOwner && (
                <button onClick={() => onEdit(project)} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Edit3 size={12} /> Edit
                </button>
              )}
              <button onClick={onClose} style={{ padding: "7px", borderRadius: "8px", border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}>
                <X size={15} />
              </button>
            </div>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>{project.projectName || project.title}</h2>
          {project.title && project.projectName && project.title !== project.projectName && (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}>{project.title}</p>
          )}
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "22px" }}>
          {/* Description */}
          {project.description && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>About</h4>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>{project.description}</p>
            </section>
          )}

          {/* My Contribution */}
          {project.myContributions && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>My Contribution</h4>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.65" }}>{project.myContributions}</p>
            </section>
          )}

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>Tech Stack</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {project.techStack.map((t) => (
                  <span key={t} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)", fontFamily: "var(--mono, monospace)", fontWeight: "600" }}>{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Roles */}
          {project.rolesNeeded?.length > 0 && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>Roles Needed</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {project.rolesNeeded.map((r) => (
                  <span key={r} style={{ ...tagStyle("#0891b2"), background: "rgba(8,145,178,.1)" }}>{r}</span>
                ))}
              </div>
            </section>
          )}

          {/* My Role */}
          {project.myRole && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>My Role</h4>
              <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <Briefcase size={13} color={dc} /> {project.myRole}
              </span>
            </section>
          )}

          {/* Team */}
          {project.teamMembers?.length > 0 && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>Team Members</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {project.teamMembers.map((m) => (
                  <span key={m} style={{ padding: "4px 10px", borderRadius: "20px", background: "var(--surface-2)", color: "var(--text-secondary)", fontSize: "12px", fontWeight: "600" }}>@{m}</span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {(project.githubRepoURL || project.liveDemoURL || project.designFilesURL) && (
            <section>
              <h4 style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: "8px" }}>Links</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {project.githubRepoURL && (
                  <a href={project.githubRepoURL} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                    <GitBranch size={14} color="var(--text-muted)" /> GitHub Repository <ArrowUpRight size={13} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                  </a>
                )}
                {project.liveDemoURL && (
                  <a href={project.liveDemoURL} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", background: `${dc}10`, border: `1px solid ${dc}30`, color: dc, textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                    <Globe size={14} /> Live Demo <ArrowUpRight size={13} style={{ marginLeft: "auto" }} />
                  </a>
                )}
                {project.designFilesURL && (
                  <a href={project.designFilesURL} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
                    <Link2 size={14} color="var(--text-muted)" /> Design Files <ArrowUpRight size={13} style={{ marginLeft: "auto", color: "var(--text-muted)" }} />
                  </a>
                )}
              </div>
            </section>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── SUB: STATS BAR ─────────────────────────── */
function StatsBar({ projects }) {
  const total     = projects.length;
  const ongoing   = projects.filter((p) => p.status === "ongoing").length;
  const completed = projects.filter((p) => p.status === "completed").length;
  const seeking   = projects.filter((p) => p.status === "seeking").length;

  const stats = [
    { label: "Total",     value: total,     color: "var(--text-primary)" },
    { label: "Ongoing",   value: ongoing,   color: "#d97706" },
    { label: "Completed", value: completed, color: "#16a34a" },
    { label: "Open",      value: seeking,   color: "#0891b2" },
  ];

  if (total === 0) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px", fontWeight: "600" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function Project({ userId, isOwnProfile }) {
  const [projects,       setProjects]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [showModal,      setShowModal]      = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");

  /* ── Fetch ── */
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError("");
    const endpoint = isOwnProfile ? "/projects" : `/users/${userId}/projects`;
    api.get(endpoint)
      .then(({ data }) => setProjects(data.projects || []))
      .catch((err) => {
        if (err.response?.status === 404) setProjects([]);  // backend not ready → empty list, no placeholder
        else setError(err.response?.data?.message || "Failed to load projects.");
      })
      .finally(() => setLoading(false));
  }, [userId, isOwnProfile]);

  /* ── CRUD ── */
  const handleCreate = async (payload) => {
    try {
      const { data } = await api.post("/projects", payload);
      setProjects([data.project, ...projects]);
      closeModal();
    } catch (err) {
      if (err.response?.status === 404) {
        // Backend placeholder: add locally with a temp id
        const tempProject = { ...payload, _id: `temp_${Date.now()}`, updatedAt: new Date().toISOString() };
        setProjects([tempProject, ...projects]);
        closeModal();
      } else throw err;
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const { data } = await api.patch(`/projects/${payload._id}`, payload);
      setProjects(projects.map((p) => (p._id === data.project._id ? data.project : p)));
      closeModal();
    } catch (err) {
      if (err.response?.status === 404) {
        setProjects(projects.map((p) => (p._id === payload._id ? { ...p, ...payload } : p)));
        closeModal();
      } else throw err;
    }
  };

  const handleDelete = async (projectId) => {
    if (!await confirm("Delete this project?", { title: 'Delete project', confirmLabel: 'Delete' })) return;
    try {
      await api.delete(`/projects/${projectId}`);
    } catch (_) {}
    setProjects(projects.filter((p) => p._id !== projectId));
    if (viewingProject?._id === projectId) setViewingProject(null);
  };

  const handleSave = (payload) => editingProject ? handleUpdate(payload) : handleCreate(payload);

  const openEdit   = (project) => { setEditingProject(project); setViewingProject(null); setShowModal(true); };
  const openCreate = ()        => { setEditingProject(null); setShowModal(true); };
  const closeModal = ()        => { setShowModal(false); setEditingProject(null); };

  /* ── Filter ── */
  const filtered = projects.filter((p) => {
    const matchFilter = filter === "all" || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || [p.projectName, p.title, p.description].some((s) => s?.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  /* ── Render states ── */
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <Loader2 size={24} color="var(--text-muted)" style={{ animation: "spin .8s linear infinite" }} />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: "#dc2626" }}>
      <AlertCircle size={32} style={{ marginBottom: "12px" }} />
      <p style={{ fontSize: "15px", fontWeight: "600" }}>{error}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}
      style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
            Projects
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            {projects.length > 0 ? `${projects.length} project${projects.length > 1 ? "s" : ""}` : "No projects added yet"}
          </p>
        </div>
        {isOwnProfile && (
          <button onClick={openCreate}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", border: "none", background: "var(--accent)", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px var(--accent-dim, rgba(255,92,53,.3))" }}>
            <Plus size={14} /> Add Project
          </button>
        )}
      </div>

      {/* ── Stats ── */}
      <StatsBar projects={projects} />

      {/* ── Filter Bar (only when projects exist) ── */}
      {projects.length > 0 && (
        <FilterBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} count={filtered.length} />
      )}

      {/* ── Project Grid ── */}
      {filtered.length > 0 ? (
        <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          <AnimatePresence>
            {filtered.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                isOwner={isOwnProfile}
                onEdit={openEdit}
                onDelete={handleDelete}
                onView={setViewingProject}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState filter={filter} isOwner={isOwnProfile} onAdd={openCreate} />
      )}

      {/* ── Create/Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: .94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: .94, y: 12 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProjectForm project={editingProject} onSave={handleSave} onCancel={closeModal} isEditing={!!editingProject} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {viewingProject && (
          <ProjectDetail
            project={viewingProject}
            onClose={() => setViewingProject(null)}
            isOwner={isOwnProfile}
            onEdit={(p) => { setViewingProject(null); openEdit(p); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}