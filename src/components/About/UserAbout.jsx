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

/* ── sub-components ── */

/* --- Empty state --- */
function EmptySection({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="text-center px-5 py-8 bg-surface-2 rounded-xl border-2 border-dashed border-border">
      <Icon size={32} color="var(--text-muted)" className="mb-3 opacity-50" />
      <p className="text-[15px] font-semibold text-text-primary mb-1">
        {title}
      </p>
      <p className="text-[13px] text-text-muted mb-3">
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-bg text-accent border border-accent-border text-xs font-medium"
          >
            {s}
            <button
              onClick={() => onRemove(s)}
              className="bg-none border-none cursor-pointer text-accent px-0.5 text-sm leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill…"
          className="flex-1 px-2.5 py-1.5 rounded-md border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none transition-colors duration-150 focus:border-accent"
        />
        <button
          onClick={() => {
            if (input.trim()) {
              onAdd(input.trim());
              setInput("");
            }
          }}
          className="px-3 py-1.5 rounded-md border-none bg-(image:--btn-grad) text-white text-[13px] font-semibold cursor-pointer shadow-btn"
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
    <div className="flex flex-col gap-4">
      {experiences.map((exp, idx) => (
        <div key={idx} className="bg-surface-1 border border-card-border rounded-[10px] px-4.5 py-3.5 relative">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[15px] font-bold text-text-primary mb-0.5">
                {exp.title}
              </h4>
              <p className="text-sm text-text-secondary mb-0.5">
                {exp.company}
              </p>
              <p className="text-xs text-text-muted mb-1.5">
                {formatDate(exp.startDate)} –{" "}
                {exp.endDate ? formatDate(exp.endDate) : "Present"}
              </p>
              <p className="text-[13px] text-text-secondary leading-snug">
                {exp.description}
              </p>
            </div>
            {isEditing && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(idx)}
                  className="px-2 py-1 rounded-md border border-border bg-transparent text-text-muted cursor-pointer text-[11px]"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => onRemove(idx)}
                  className="px-2 py-1 rounded-md border border-error-border bg-transparent text-error cursor-pointer text-[11px]"
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-[13px] cursor-pointer transition-colors duration-150 hover:border-accent hover:text-accent"
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
    <div className="flex flex-col gap-4">
      {educations.map((edu, idx) => (
        <div key={idx} className="bg-surface-1 border border-card-border rounded-[10px] px-4.5 py-3.5 relative">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-[15px] font-bold text-text-primary mb-0.5">
                {edu.degree} {edu.field && `in ${edu.field}`}
              </h4>
              <p className="text-sm text-text-secondary mb-0.5">
                {edu.institution}
              </p>
              {edu.graduationYear && (
                <p className="text-xs text-text-muted">
                  Graduated {edu.graduationYear}
                </p>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(idx)}
                  className="px-2 py-1 rounded-md border border-border bg-transparent text-text-muted cursor-pointer text-[11px]"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={() => onRemove(idx)}
                  className="px-2 py-1 rounded-md border border-error-border bg-transparent text-error cursor-pointer text-[11px]"
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
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-[13px] cursor-pointer transition-colors duration-150 hover:border-accent hover:text-accent"
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
    <div className="flex flex-col gap-3">
      {socialFields.map(({ key, icon: Icon, label, placeholder }) => (
        <div key={key} className="flex items-center gap-2.5">
          <Icon size={16} color="var(--text-muted)" className="shrink-0" />
          {isEditing ? (
            <input
              type="url"
              value={links[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-2.5 py-1.5 rounded-md border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none transition-colors duration-150 focus:border-accent"
            />
          ) : links[key] ? (
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-accent no-underline break-all"
            >
              {links[key].replace(/^https?:\/\//, "").slice(0, 40)}
              {links[key].length > 40 && "…"}
            </a>
          ) : (
            <span className="text-[13px] text-text-muted">
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
    <div className="flex flex-col gap-3">
      {paths.map((p, idx) => (
        <div key={idx} className="bg-surface-1 border border-card-border rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-bg flex items-center justify-center shrink-0">
            <GitBranch size={18} color="var(--accent)" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary mb-0.5">
              {p.name}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-surface-3 rounded-sm overflow-hidden">
                <div
                  className="h-full bg-accent rounded-sm"
                  style={{ width: `${p.progress || 0}%` }}
                />
              </div>
              <span className="text-[11px] text-text-muted">
                {p.progress || 0}%
              </span>
            </div>
          </div>
          <span
            className="px-2.5 py-0.5 rounded-xl text-[10px] font-semibold"
            style={{
              background: p.progress >= 100 ? "rgba(34,197,94,0.12)" : "rgba(245,158,11,0.12)",
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
      className="mt-3.5 flex flex-col gap-6"
    >
      {/* Edit / view toggle */}
      {isOwnProfile && (
        <div className="flex justify-end gap-2 mb-1">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={handleCancel} disabled={saving}>
                <X size={14} /> Cancel
              </Button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border-none text-[13px] font-semibold ${saveSuccess ? 'bg-success-bg text-success' : 'bg-(image:--btn-grad) text-white shadow-btn'} ${saving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
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
        <div className="px-3.5 py-2.5 rounded-lg bg-error-bg border border-error-border text-error text-[13px] flex items-center justify-between">
          <span>
            <AlertCircle size={14} className="inline mr-2" />
            {saveError}
          </span>
          <button
            onClick={() => setSaveError("")}
            className="bg-none border-none cursor-pointer text-error text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Contribution Score */}
      <div className="bg-card border border-card-border rounded-xl px-5 py-4 flex items-center gap-4">
        <Award size={32} color="var(--accent)" />
        <div>
          <p className="text-sm font-semibold text-text-primary mb-0.5">
            Contribution Score
          </p>
          <p className="text-2xl font-extrabold text-accent">
            {contributionScore}
          </p>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-text-muted">
          Earned via reviews, projects, and contributions
        </span>
      </div>

      {/* Skills */}
      <div className="bg-card border border-card-border rounded-xl px-5 py-4.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3">
          Skills & Expertise
        </h3>
        {isEditing ? (
          <SkillInput
            skills={skills}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
          />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {skills.length === 0 ? (
              <span className="text-text-muted text-[13px]">
                No skills added yet
              </span>
            ) : (
              skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-accent-bg text-accent border border-accent-border"
                >
                  {s}
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="bg-card border border-card-border rounded-xl px-5 py-4.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3">
          <Briefcase size={16} className="inline mr-2" /> Experience
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
      <div className="bg-card border border-card-border rounded-xl px-5 py-4.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3">
          <GraduationCap size={16} className="inline mr-2" /> Education
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
      <div className="bg-card border border-card-border rounded-xl px-5 py-4.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3">
          <GitBranch size={16} className="inline mr-2" /> Learning Paths
        </h3>
        <LearningPaths paths={learningPaths} />
      </div>

      {/* Social Links */}
      <div className="bg-card border border-card-border rounded-xl px-5 py-4.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-3">
          <Link2 size={16} className="inline mr-2" /> Social & External Links
        </h3>
        <SocialLinks
          links={socialLinks}
          isEditing={isEditing}
          onChange={updateSocialLink}
        />
      </div>
    </motion.div>
  );
}
