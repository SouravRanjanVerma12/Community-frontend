// src/components/profile/UserAbout.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, GraduationCap, GitBranch, Globe,
  Edit3, Save, X, Plus, Trash2, Link2, Calendar,
  CheckCircle, AlertCircle, Loader2, Users, Star, Award,
  // Use these instead:
  Code, User, Share2,
} from 'lucide-react';
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/axiosInstance";
import { confirm } from "../ui/ConfirmDialog";
import Button from "../ui/Button";

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function timeSince(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

/* ── sub-components ── */

/* --- Empty state --- */
function EmptySection({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        background: "var(--surface-2)",
        borderRadius: "12px",
        border: "2px dashed var(--border)",
      }}
    >
      <Icon
        size={32}
        color="var(--text-muted)"
        style={{ marginBottom: "12px", opacity: 0.5 }}
      />
      <p
        style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          marginBottom: "12px",
        }}
      >
        {description}
      </p>
      {action && (
        <Button onClick={action} size="sm">
          {actionLabel || "Add"}
        </Button>
      )}
    </div>
  );
}

/* --- Skill input (editable) --- */
function SkillInput({ skills, onAdd, onRemove }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {skills.map((s) => (
          <span
            key={s}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "20px",
              background: "var(--accent-bg)",
              color: "var(--accent)",
              border: "1px solid var(--accent-border)",
              fontSize: "12px",
              fontWeight: "500",
            }}
          >
            {s}
            <button
              onClick={() => onRemove(s)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--accent)",
                padding: "0 2px",
                fontSize: "14px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill…"
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1.5px solid var(--border)",
            background: "var(--input-bg)",
            fontSize: "13px",
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "none",
            background: "var(--btn-grad)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "var(--btn-grad-shadow)",
          }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/* --- Experience section --- */
function ExperienceSection({
  experiences,
  isEditing,
  onAdd,
  onEdit,
  onRemove,
}) {
  if (!isEditing && experiences.length === 0) {
    return (
      <EmptySection
        icon={Briefcase}
        title="No experience yet"
        description="Add your work history to showcase your professional journey."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {experiences.map((exp, idx) => (
        <div
          key={idx}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "14px 18px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}
              >
                {exp.title}
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginBottom: "2px",
                }}
              >
                {exp.company}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginBottom: "6px",
                }}
              >
                {formatDate(exp.startDate)} –{" "}
                {exp.endDate ? formatDate(exp.endDate) : "Present"}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: "1.5",
                }}
              >
                {exp.description}
              </p>
            </div>
            {isEditing && (
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                <button
                  onClick={() => onEdit(idx)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => onRemove(idx)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--error-border)",
                    background: "transparent",
                    color: "var(--error-text)",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {isEditing && (
        <button
          onClick={() => onAdd()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1.5px dashed var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Plus size={14} /> Add experience
        </button>
      )}
    </div>
  );
}

/* --- Education section --- */
function EducationSection({ educations, isEditing, onAdd, onEdit, onRemove }) {
  if (!isEditing && educations.length === 0) {
    return (
      <EmptySection
        icon={GraduationCap}
        title="No education yet"
        description="Share your academic background."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {educations.map((edu, idx) => (
        <div
          key={idx}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--card-border)",
            borderRadius: "10px",
            padding: "14px 18px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}
              >
                {edu.degree} {edu.field && `in ${edu.field}`}
              </h4>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  marginBottom: "2px",
                }}
              >
                {edu.institution}
              </p>
              {edu.graduationYear && (
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Graduated {edu.graduationYear}
                </p>
              )}
            </div>
            {isEditing && (
              <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                <button
                  onClick={() => onEdit(idx)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => onRemove(idx)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid var(--error-border)",
                    background: "transparent",
                    color: "var(--error-text)",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      {isEditing && (
        <button
          onClick={() => onAdd()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1.5px dashed var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: "13px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <Plus size={14} /> Add education
        </button>
      )}
    </div>
  );
}

/* --- Social Links --- */
function SocialLinks({ links, isEditing, onChange }) {
  const socialFields = [
  { key: 'github', icon: Code, label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin', icon: User, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'twitter', icon: Share2, label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
  { key: 'website', icon: Globe, label: 'Website', placeholder: 'https://yoursite.com' },
  { key: 'figma', icon: Link2, label: 'Figma', placeholder: 'https://figma.com/@username' },
];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {socialFields.map(({ key, icon: Icon, label, placeholder }) => (
        <div
          key={key}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <Icon size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          {isEditing ? (
            <input
              type="url"
              value={links[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          ) : links[key] ? (
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "13px",
                color: "var(--accent)",
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {links[key].replace(/^https?:\/\//, "").slice(0, 40)}
              {links[key].length > 40 && "…"}
            </a>
          ) : (
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Not provided
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* --- Learning Paths (read-only) --- */
function LearningPaths({ paths }) {
  if (!paths || paths.length === 0) {
    return (
      <EmptySection
        icon={GitBranch}
        title="No active learning paths"
        description="Start a roadmap from the Learn section to track your progress."
      />
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {paths.map((p, idx) => (
        <div
          key={idx}
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--card-border)",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--accent-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <GitBranch size={18} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary)",
                marginBottom: "2px",
              }}
            >
              {p.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  flex: 1,
                  height: "4px",
                  background: "var(--surface-3)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${p.progress || 0}%`,
                    height: "100%",
                    background: "var(--accent)",
                    borderRadius: "2px",
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                {p.progress || 0}%
              </span>
            </div>
          </div>
          <span
            style={{
              padding: "2px 10px",
              borderRadius: "12px",
              fontSize: "10px",
              fontWeight: "600",
              background:
                p.progress >= 100
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(245,158,11,0.12)",
              color: p.progress >= 100 ? "#16a34a" : "#d97706",
            }}
          >
            {p.progress >= 100 ? "✅ Complete" : "In progress"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN UserAbout COMPONENT
   ──────────────────────────────────────────────────────────── */
export default function UserAbout({ profile, isOwnProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Local state for all editable fields
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [learningPaths, setLearningPaths] = useState([]);
  const [contributionScore, setContributionScore] = useState(0);

  // Initialize from profile when it changes
  useEffect(() => {
    if (profile) {
      setSkills(profile.skills || []);
      setExperiences(profile.experience || []);
      setEducations(profile.education || []);
      setSocialLinks(profile.socialLinks || {});
      setLearningPaths(profile.learningPaths || []);
      setContributionScore(profile.contributionScore || 0);
    }
  }, [profile]);

  // Save all changes
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await api.patch("/users/profile", {
        skills,
        experience: experiences,
        education: educations,
        socialLinks,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original profile data
    setSkills(profile.skills || []);
    setExperiences(profile.experience || []);
    setEducations(profile.education || []);
    setSocialLinks(profile.socialLinks || {});
    setIsEditing(false);
    setSaveError("");
  };

  // Child section callbacks
  const addExperience = () => {
    const newExp = {
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setExperiences([...experiences, newExp]);
  };

  const editExperience = (idx) => {
    // simple inline editing: we'll replace with a modal or inline form later; for now we just allow direct update via setState
    // This is a placeholder – we'll implement a simple prompt or we can make each field editable directly.
    // For simplicity, we'll just prompt for new values using a generic prompt.
    // In production, you'd use a modal form.
    const exp = experiences[idx];
    const newCompany = prompt("Company:", exp.company);
    if (newCompany !== null) {
      const newTitle = prompt("Title:", exp.title);
      const newStart = prompt("Start Date (YYYY-MM-DD):", exp.startDate);
      const newEnd = prompt(
        "End Date (YYYY-MM-DD) or leave empty for Present:",
        exp.endDate,
      );
      const newDesc = prompt("Description:", exp.description);
      const updated = {
        ...exp,
        company: newCompany || "",
        title: newTitle || "",
        startDate: newStart || "",
        endDate: newEnd || "",
        description: newDesc || "",
      };
      const newList = [...experiences];
      newList[idx] = updated;
      setExperiences(newList);
    }
  };

  const removeExperience = async (idx) => {
    if (await confirm("Remove this experience?", { title: 'Remove experience', confirmLabel: 'Remove' })) {
      setExperiences(experiences.filter((_, i) => i !== idx));
    }
  };

  const addEducation = () => {
    const newEdu = {
      institution: "",
      degree: "",
      field: "",
      graduationYear: "",
    };
    setEducations([...educations, newEdu]);
  };

  const editEducation = (idx) => {
    const edu = educations[idx];
    const newInst = prompt("Institution:", edu.institution);
    if (newInst !== null) {
      const newDegree = prompt("Degree:", edu.degree);
      const newField = prompt("Field of Study:", edu.field);
      const newYear = prompt("Graduation Year:", edu.graduationYear);
      const updated = {
        ...edu,
        institution: newInst || "",
        degree: newDegree || "",
        field: newField || "",
        graduationYear: newYear || "",
      };
      const newList = [...educations];
      newList[idx] = updated;
      setEducations(newList);
    }
  };

  const removeEducation = async (idx) => {
    if (await confirm("Remove this education?", { title: 'Remove education', confirmLabel: 'Remove' })) {
      setEducations(educations.filter((_, i) => i !== idx));
    }
  };

  const updateSocialLink = (key, value) => {
    setSocialLinks({ ...socialLinks, [key]: value });
  };

  const handleAddSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        marginTop: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Edit / view toggle */}
      {isOwnProfile && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                <X size={14} /> Cancel
              </Button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: saveSuccess ? "var(--success-bg)" : "var(--btn-grad)",
                  color: saveSuccess ? "var(--success-text)" : "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saveSuccess
                    ? "none"
                    : "var(--btn-grad-shadow)",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="spin" />
                ) : saveSuccess ? (
                  <CheckCircle size={14} />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving…" : saveSuccess ? "Saved!" : "Save Changes"}
              </button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit3 size={14} /> Edit Profile
            </Button>
          )}
        </div>
      )}

      {saveError && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            background: "var(--error-bg)",
            border: "1px solid var(--error-border)",
            color: "var(--error-text)",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            <AlertCircle
              size={14}
              style={{ display: "inline", marginRight: "8px" }}
            />
            {saveError}
          </span>
          <button
            onClick={() => setSaveError("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--error-text)",
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Contribution Score */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Award size={32} color="var(--accent)" />
        <div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "2px",
            }}
          >
            Contribution Score
          </p>
          <p
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "var(--accent)",
            }}
          >
            {contributionScore}
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Earned via reviews, projects, and contributions
        </span>
      </div>

      {/* Skills */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          Skills & Expertise
        </h3>
        {isEditing ? (
          <SkillInput
            skills={skills}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
          />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {skills.length === 0 ? (
              <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                No skills added yet
              </span>
            ) : (
              skills.map((s) => (
                <span
                  key={s}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    background: "var(--accent-bg)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent-border)",
                  }}
                >
                  {s}
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Experience */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          <Briefcase
            size={16}
            style={{ display: "inline", marginRight: "8px" }}
          />{" "}
          Experience
        </h3>
        <ExperienceSection
          experiences={experiences}
          isEditing={isEditing}
          onAdd={addExperience}
          onEdit={editExperience}
          onRemove={removeExperience}
        />
      </div>

      {/* Education */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          <GraduationCap
            size={16}
            style={{ display: "inline", marginRight: "8px" }}
          />{" "}
          Education
        </h3>
        <EducationSection
          educations={educations}
          isEditing={isEditing}
          onAdd={addEducation}
          onEdit={editEducation}
          onRemove={removeEducation}
        />
      </div>

      {/* Learning Paths (read-only) */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          <GitBranch
            size={16}
            style={{ display: "inline", marginRight: "8px" }}
          />{" "}
          Learning Paths
        </h3>
        <LearningPaths paths={learningPaths} />
      </div>

      {/* Social Links */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          borderRadius: "12px",
          padding: "18px 20px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "12px",
          }}
        >
          <Link2 size={16} style={{ display: "inline", marginRight: "8px" }} />{" "}
          Social & External Links
        </h3>
        <SocialLinks
          links={socialLinks}
          isEditing={isEditing}
          onChange={updateSocialLink}
        />
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </motion.div>
  );
}
