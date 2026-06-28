// src/components/profile/Project.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit3, Trash2,  GitBranch, Users,
  X, Loader2, FolderGit2, Link2,  Briefcase, Search,
  Clock, CheckCircle, PauseCircle,
  AlertCircle, Globe, ArrowUpRight, MoreHorizontal,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axiosInstance";
import { queryClient } from "../../api/queryClient";
import { DOMAINS } from "../../data/mockPosts";
import { confirm } from "../ui/ConfirmDialog";
import Button from "../ui/Button";
import { useProjects } from "../../hooks/useProjects";

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

const fieldClasses = "w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none box-border";
const labelClasses = "text-xs font-semibold text-text-secondary block mb-1.5 tracking-[0.3px]";
const tagClasses = (color) => ({
  className: "inline-flex items-center gap-1 px-2.5 py-[3px] rounded-2xl text-[11px] font-semibold",
  style: { background: `${color}18`, color, border: `1px solid ${color}30` },
});

/* ─────────────────────────── SUB: STATUS BADGE ─────────────────────────── */
function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.ongoing;
  const Icon = s.icon;
  const tag = tagClasses(s.color);
  return (
    <span className={tag.className} style={{ ...tag.style, background: s.bg }}>
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

  const tag = tagClasses(dc);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: .96 }}
      onClick={() => onView(project)}
      className="bg-card border border-card-border rounded-[14px] p-5 flex flex-col gap-3 cursor-pointer relative transition-[border-color,box-shadow] duration-150"
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = dc; e.currentTarget.style.boxShadow = `0 0 0 1px ${dc}30, 0 8px 24px rgba(0,0,0,.18)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--card-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Domain accent strip */}
      <div className="absolute top-0 left-5 right-5 h-0.5 rounded-b-[4px]" style={{ background: `linear-gradient(90deg, ${dc}, transparent)` }} />

      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-bold text-text-primary mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {project.projectName || project.title}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            <span className={tag.className} style={tag.style}>{domainLabel(project.domain)}</span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {isOwner && (
          <div ref={menuRef} className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg border border-border bg-transparent text-text-muted cursor-pointer flex items-center"
            >
              <MoreHorizontal size={15} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: .92, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: .92 }}
                  className="absolute right-0 top-[calc(100%+6px)] bg-card border border-card-border rounded-[10px] p-1.5 z-50 min-w-[130px] shadow-[0_8px_24px_rgba(0,0,0,.3)]"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md border-none bg-transparent text-text-secondary cursor-pointer text-[13px] transition-colors duration-150 hover:bg-surface-2"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(project._id); }}
                    className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md border-none bg-transparent text-error cursor-pointer text-[13px] transition-colors duration-150 hover:bg-[rgba(239,68,68,.08)]"
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
        <p className="text-xs text-text-muted italic -mt-1.5">{project.title}</p>
      )}

      {/* Description */}
      <p className="text-[13px] text-text-secondary leading-[1.55]">
        {project.description?.slice(0, 130)}{project.description?.length > 130 ? "…" : ""}
      </p>

      {/* Tech Stack */}
      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 5).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-surface-2 text-text-muted border border-border font-mono font-semibold">{t}</span>
          ))}
          {project.techStack.length > 5 && (
            <span className="px-2 py-0.5 rounded text-[10px] text-text-muted">+{project.techStack.length - 5}</span>
          )}
        </div>
      )}

      {/* Roles Needed */}
      {project.rolesNeeded?.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wide">Need:</span>
          {project.rolesNeeded.slice(0, 3).map((r) => (
            <span key={r} className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-2xl text-[10px] font-semibold bg-[rgba(8,145,178,.1)] text-[#0891b2] border border-[#0891b230]">{r}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 flex-wrap mt-0.5 pt-2.5 border-t border-card-border">
        {project.myRole && (
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Briefcase size={11} /> {project.myRole}
          </span>
        )}
        {project.teamMembers?.length > 0 && (
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Users size={11} /> {project.teamMembers.length} member{project.teamMembers.length > 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto flex gap-2 items-center">
          {project.githubRepoURL && (
            <a
              href={project.githubRepoURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="text-text-muted text-[11px] flex items-center gap-1 no-underline px-1.5 py-1 rounded-md border border-border transition-colors duration-150 hover:border-text-primary hover:text-text-primary"
            >
              <GitBranch size={11} /> Repo
            </a>
          )}
          {project.liveDemoURL && (
            <a
              href={project.liveDemoURL} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="text-text-muted text-[11px] flex items-center gap-1 no-underline px-1.5 py-1 rounded-md border border-border transition-colors duration-150"
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
function FilterBar({ filter, setFilter, search, setSearch }) {
  return (
    <div className="flex gap-2.5 flex-wrap items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className={`${fieldClasses} pl-8.5 text-[13px] py-2`}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-2 rounded-[10px] p-1 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value} onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-[7px] border-none cursor-pointer text-xs font-semibold transition-all duration-150"
            style={{
              background: filter === f.value ? "var(--card-bg)" : "transparent",
              color: filter === f.value ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: filter === f.value ? "0 1px 4px rgba(0,0,0,.15)" : "none",
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-5 py-15">
      <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
        <FolderGit2 size={28} color="var(--text-muted)" />
      </div>
      <p className="text-base font-bold text-text-primary mb-1.5">
        {isFiltered ? `No ${filter} projects` : "No projects yet"}
      </p>
      <p className="text-[13px] text-text-muted max-w-[340px] mx-auto mb-5 leading-snug">
        {isFiltered
          ? "Try a different filter or add a new project."
          : isOwner
            ? "Showcase your work — add your first project to build your portfolio."
            : "This user hasn't added any projects yet."}
      </p>
      {isOwner && (
        <Button onClick={onAdd}>
          <Plus size={14} /> Add Project
        </Button>
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
      <label className={labelClasses}>{label}</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {values.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-2xl text-[11px]" style={{ background: colorBg, color, border: `1px solid ${color}30` }}>
              {v}
              <button onClick={() => onRemove(v)} className="bg-none border-none cursor-pointer p-0 text-[13px] leading-none flex" style={{ color }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <input
          value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder={placeholder}
          className={`${fieldClasses} text-[13px] py-2`}
        />
        <button onClick={add} className="px-3.5 py-2 rounded-lg border-none text-white cursor-pointer shrink-0 flex items-center" style={{ background: color }}>
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
    <div className="bg-card border border-card-border rounded-[18px] w-[min(620px,95vw)] max-h-[90vh] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,.5)]">
      {/* Header */}
      <div className="px-6 pt-5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-text-primary m-0">{isEditing ? "Edit Project" : "Add New Project"}</h2>
          <p className="text-xs text-text-muted mt-0.5">Showcase your work on DevEcosystem</p>
        </div>
        <button onClick={onCancel} className="bg-surface-2 border-none rounded-lg p-1.5 text-text-muted cursor-pointer flex">
          <X size={16} />
        </button>
      </div>

      {/* Form Tabs */}
      <div className="flex gap-0 pt-3.5 px-6 border-b border-card-border">
        {TABS.map((t) => (
          <button
            key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-3.5 py-1.5 border-none bg-transparent cursor-pointer text-xs font-semibold -mb-px transition-all duration-150"
            style={{
              color: activeTab === t.id ? "var(--accent)" : "var(--text-muted)",
              borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {activeTab === "basics" && (
            <motion.div key="basics" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3.5">
              <div>
                <label className={labelClasses}>Project Name <span className="text-error">*</span></label>
                <input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} placeholder="e.g., DevEcosystem Frontend" className={fieldClasses} />
              </div>
              <div>
                <label className={labelClasses}>Tagline / Subtitle</label>
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="A one-liner about the project" className={fieldClasses} />
              </div>
              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What does this project do? What problem does it solve?" rows={5}
                  className={`${fieldClasses} resize-y font-[inherit] leading-relaxed`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClasses}>Domain</label>
                  <select value={form.domain} onChange={(e) => set("domain", e.target.value)} className={`${fieldClasses} cursor-pointer`}>
                    {DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Status</label>
                  <select value={form.status} onChange={(e) => set("status", e.target.value)} className={`${fieldClasses} cursor-pointer`}>
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
            <motion.div key="tech" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4.5">
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
                <label className={labelClasses}>Your Role in this Project</label>
                <input value={form.myRole} onChange={(e) => set("myRole", e.target.value)} placeholder="e.g., Lead Frontend Developer" className={fieldClasses} />
              </div>
            </motion.div>
          )}

          {activeTab === "contrib" && (
            <motion.div key="contrib" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3.5">
              <div className="px-3.5 py-3 rounded-[10px] bg-[rgba(8,145,178,.08)] border border-[rgba(8,145,178,.2)] text-xs text-[#0891b2] leading-snug">
                <strong>Tip:</strong> Detailed contributions feed your Contribution Score and prove real skills to collaborators and recruiters.
              </div>
              <div>
                <label className={labelClasses}>My Contributions</label>
                <textarea
                  value={form.myContributions} onChange={(e) => set("myContributions", e.target.value)}
                  placeholder="Describe what you built, features you implemented, decisions you made, challenges you solved…"
                  rows={7} className={`${fieldClasses} resize-y font-[inherit] leading-[1.55]`}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "links" && (
            <motion.div key="links" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-3.5">
              <div>
                <label className={labelClasses}><GitBranch size={11} className="inline mr-1" />GitHub Repo URL</label>
                <input type="url" value={form.githubRepoURL} onChange={(e) => set("githubRepoURL", e.target.value)} placeholder="https://github.com/username/repo" className={fieldClasses} />
              </div>
              <div>
                <label className={labelClasses}><Globe size={11} className="inline mr-1" />Live Demo URL</label>
                <input type="url" value={form.liveDemoURL} onChange={(e) => set("liveDemoURL", e.target.value)} placeholder="https://yourproject.com" className={fieldClasses} />
              </div>
              <div>
                <label className={labelClasses}><Link2 size={11} className="inline mr-1" />Design Files URL (Figma, etc.)</label>
                <input type="url" value={form.designFilesURL} onChange={(e) => set("designFilesURL", e.target.value)} placeholder="https://figma.com/file/..." className={fieldClasses} />
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
      <div className="px-6 py-4 border-t border-card-border flex justify-between items-center gap-3">
        <div className="flex-1">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-error-bg border border-error-border text-error text-xs">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-2.5 shrink-0">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? "Saving…" : isEditing ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SUB: PROJECT DETAIL DRAWER ─────────────────────────── */
function ProjectDetail({ project, onClose, isOwner, onEdit }) {
  if (!project) return null;
  const dc = domainColor(project.domain);
  const tag = tagClasses(dc);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-9999 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[min(520px,100vw)] h-full bg-card border-l border-card-border overflow-y-auto flex flex-col"
      >
        {/* Accent */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${dc}, ${dc}44)` }} />

        {/* Header */}
        <div className="p-6 border-b border-card-border">
          <div className="flex justify-between items-start mb-2.5">
            <div className="flex gap-1.5 flex-wrap">
              <span className={tag.className} style={tag.style}>{domainLabel(project.domain)}</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <button
                  onClick={() => onEdit(project)}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-transparent text-text-muted cursor-pointer text-xs font-semibold flex items-center gap-1"
                >
                  <Edit3 size={12} /> Edit
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg border border-border bg-transparent text-text-muted cursor-pointer flex">
                <X size={15} />
              </button>
            </div>
          </div>
          <h2 className="text-[22px] font-extrabold text-text-primary mb-1">{project.projectName || project.title}</h2>
          {project.title && project.projectName && project.title !== project.projectName && (
            <p className="text-[13px] text-text-muted italic">{project.title}</p>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col gap-5.5">
          {/* Description */}
          {project.description && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">About</h4>
              <p className="text-sm text-text-secondary leading-[1.65]">{project.description}</p>
            </section>
          )}

          {/* My Contribution */}
          {project.myContributions && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">My Contribution</h4>
              <p className="text-sm text-text-secondary leading-[1.65]">{project.myContributions}</p>
            </section>
          )}

          {/* Tech Stack */}
          {project.techStack?.length > 0 && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-md text-xs bg-surface-2 text-text-secondary border border-border font-mono font-semibold">{t}</span>
                ))}
              </div>
            </section>
          )}

          {/* Roles */}
          {project.rolesNeeded?.length > 0 && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">Roles Needed</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.rolesNeeded.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-2xl text-[11px] font-semibold bg-[rgba(8,145,178,.1)] text-[#0891b2] border border-[#0891b230]">{r}</span>
                ))}
              </div>
            </section>
          )}

          {/* My Role */}
          {project.myRole && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">My Role</h4>
              <span className="text-[13px] text-text-primary font-semibold flex items-center gap-1.5">
                <Briefcase size={13} color={dc} /> {project.myRole}
              </span>
            </section>
          )}

          {/* Team */}
          {project.teamMembers?.length > 0 && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">Team Members</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.teamMembers.map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-full bg-surface-2 text-text-secondary text-xs font-semibold">@{m}</span>
                ))}
              </div>
            </section>
          )}

          {/* Links */}
          {(project.githubRepoURL || project.liveDemoURL || project.designFilesURL) && (
            <section>
              <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.8px] mb-2">Links</h4>
              <div className="flex flex-col gap-2">
                {project.githubRepoURL && (
                  <a
                    href={project.githubRepoURL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-surface-2 border border-border text-text-primary no-underline text-[13px] font-semibold"
                  >
                    <GitBranch size={14} color="var(--text-muted)" /> GitHub Repository <ArrowUpRight size={13} className="ml-auto text-text-muted" />
                  </a>
                )}
                {project.liveDemoURL && (
                  <a
                    href={project.liveDemoURL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] no-underline text-[13px] font-semibold"
                    style={{ background: `${dc}10`, border: `1px solid ${dc}30`, color: dc }}
                  >
                    <Globe size={14} /> Live Demo <ArrowUpRight size={13} className="ml-auto" />
                  </a>
                )}
                {project.designFilesURL && (
                  <a
                    href={project.designFilesURL} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-surface-2 border border-border text-text-primary no-underline text-[13px] font-semibold"
                  >
                    <Link2 size={14} color="var(--text-muted)" /> Design Files <ArrowUpRight size={13} className="ml-auto text-text-muted" />
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
    <div className="grid grid-cols-4 gap-2.5">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-card-border rounded-xl p-3.5 text-center">
          <div className="text-[22px] font-extrabold leading-none" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[11px] text-text-muted mt-1 font-semibold">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── MAIN COMPONENT ─────────────────────────── */
export default function Project({ userId, isOwnProfile }) {
  const queryKey = ["projects", userId, isOwnProfile];
  const { data: projects = [], isLoading: loading, error: queryError } = useProjects(userId, isOwnProfile);
  const error = queryError ? (queryError.response?.data?.message || "Failed to load projects.") : "";
  const [showModal,      setShowModal]      = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");

  /* ── CRUD ── */
  const handleCreate = async (payload) => {
    try {
      const { data } = await api.post("/projects", payload);
      queryClient.setQueryData(queryKey, (prev = []) => [data.project, ...prev]);
      closeModal();
    } catch (err) {
      if (err.response?.status === 404) {
        // Backend placeholder: add locally with a temp id
        const tempProject = { ...payload, _id: `temp_${Date.now()}`, updatedAt: new Date().toISOString() };
        queryClient.setQueryData(queryKey, (prev = []) => [tempProject, ...prev]);
        closeModal();
      } else throw err;
    }
  };

  const handleUpdate = async (payload) => {
    try {
      const { data } = await api.patch(`/projects/${payload._id}`, payload);
      queryClient.setQueryData(queryKey, (prev = []) => prev.map((p) => (p._id === data.project._id ? data.project : p)));
      closeModal();
    } catch (err) {
      if (err.response?.status === 404) {
        queryClient.setQueryData(queryKey, (prev = []) => prev.map((p) => (p._id === payload._id ? { ...p, ...payload } : p)));
        closeModal();
      } else throw err;
    }
  };

  const handleDelete = async (projectId) => {
    if (!await confirm("Delete this project?", { title: 'Delete project', confirmLabel: 'Delete' })) return;
    try {
      await api.delete(`/projects/${projectId}`);
    } catch (_) {}
    queryClient.setQueryData(queryKey, (prev = []) => prev.filter((p) => p._id !== projectId));
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
    <div className="flex justify-center py-15">
      <Loader2 size={24} color="var(--text-muted)" className="animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center px-5 py-10 text-error">
      <AlertCircle size={32} className="mb-3" />
      <p className="text-[15px] font-semibold">{error}</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .2 }}
      className="mt-3.5 flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-2.5">
        <div>
          <h3 className="text-[17px] font-extrabold text-text-primary m-0">
            Projects
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {projects.length > 0 ? `${projects.length} project${projects.length > 1 ? "s" : ""}` : "No projects added yet"}
          </p>
        </div>
        {isOwnProfile && (
          <Button onClick={openCreate}>
            <Plus size={14} /> Add Project
          </Button>
        )}
      </div>

      {/* ── Stats ── */}
      <StatsBar projects={projects} />

      {/* ── Filter Bar (only when projects exist) ── */}
      {projects.length > 0 && (
        <FilterBar filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} />
      )}

      {/* ── Project Grid ── */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-9999 p-4"
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
