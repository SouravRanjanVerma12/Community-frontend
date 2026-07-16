import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/authStore';
import ImageCropper from '../ui/ImageCropper';
import { SkillInput, SocialLinks, RolePicker } from '../About/UserAbout';

const STEPS = [
  { key: 'role',       title: 'Welcome! Who are you?',      subtitle: 'Select all that apply — this helps us personalize your experience.' },
  { key: 'profile',    title: 'Set up your profile',        subtitle: 'Add a photo and tell the community a bit about yourself.' },
  { key: 'skills',     title: 'What are your skills?',      subtitle: 'Add a few skills so collaborators and recruiters can find you.' },
  { key: 'background', title: 'Experience & education',     subtitle: 'Optional — you can always add more later from your profile.' },
  { key: 'social',     title: 'Link your socials',          subtitle: 'Optional — help people find you elsewhere.' },
];

const inputCls    = 'px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 focus:border-accent-border w-full';
const textareaCls = 'px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-secondary leading-relaxed resize-y font-[inherit] outline-none transition-colors duration-150 focus:border-accent-border';

async function uploadAvatarBlob(blob) {
  const fd = new FormData();
  fd.append('file', blob, 'upload.jpg');
  const { data } = await api.post('/upload/avatar', fd);
  return data.url;
}

export default function OnboardingModal() {
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep]     = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [roles, setRoles]         = useState([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio]             = useState('');
  const [location, setLocation]   = useState('');
  const [age, setAge]             = useState('');
  const [skills, setSkills]       = useState([]);
  const [experience, setExperience] = useState({ company: '', title: '', startDate: '', endDate: '', description: '' });
  const [education, setEducation]   = useState({ institution: '', degree: '', field: '', graduationYear: '' });
  const [socialLinks, setSocialLinks] = useState({ github: '', linkedin: '', twitter: '', website: '', figma: '' });

  const [cropFile, setCropFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const toggleRole    = (r) => setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  const addSkill       = (s) => setSkills((prev) => (prev.includes(s) ? prev : [...prev, s]));
  const removeSkill    = (s) => setSkills((prev) => prev.filter((x) => x !== s));
  const updateSocialLink = (key, value) => setSocialLinks((prev) => ({ ...prev, [key]: value }));

  const onFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (file) setCropFile(file);
    e.target.value = '';
  };

  const onCropComplete = async (blob) => {
    setCropFile(null);
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatarBlob(blob);
      setAvatarUrl(url);
    } catch {
      setError('Photo upload failed — you can add one later from your profile.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const buildPayload = () => {
    const payload = { onboarded: true };
    if (roles.length) payload.roles = roles;
    if (avatarUrl) payload.avatarUrl = avatarUrl;
    if (bio.trim()) payload.bio = bio.trim();
    if (location.trim()) payload.location = location.trim();
    const ageNum = Number(age);
    if (age && Number.isFinite(ageNum) && ageNum >= 13 && ageNum <= 120) payload.age = ageNum;
    if (skills.length) payload.skills = skills;
    if (experience.company.trim() || experience.title.trim()) payload.experience = [experience];
    if (education.institution.trim() || education.degree.trim()) payload.education = [education];
    const links = Object.fromEntries(Object.entries(socialLinks).filter(([, v]) => v.trim()));
    if (Object.keys(links).length) payload.socialLinks = links;
    return payload;
  };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/users/profile', buildPayload());
      setUser(data.user);
    } catch {
      setError('Something went wrong saving your profile. Try again.');
      setSaving(false);
    }
  };

  const isLast   = step === STEPS.length - 1;
  const current  = STEPS[step];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-200 bg-black/35 backdrop-blur-xs flex items-center justify-center p-5"
      >
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[560px] max-h-[88vh] bg-card rounded-2xl border border-card-border shadow-popup overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pt-4.5 pb-3.5 px-5.5 shrink-0">
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <span
                  key={s.key}
                  className="w-6 h-1.5 rounded-full transition-colors duration-200"
                  style={{ background: i <= step ? 'var(--accent)' : 'var(--border)' }}
                />
              ))}
            </div>
            <button
              type="button" onClick={finish} disabled={saving}
              className="text-[13px] font-medium text-text-muted bg-none border-none cursor-pointer transition-colors duration-150 hover:text-text-secondary"
            >
              Skip for now
            </button>
          </div>

          {/* Scrollable body */}
          <div className="px-5.5 py-4 flex flex-col gap-3.5 flex-1 min-h-0 overflow-y-auto *:shrink-0">
            <div>
              <h2 className="text-lg font-bold text-text-primary tracking-[-0.2px] mb-1">{current.title}</h2>
              <p className="text-[13px] text-text-muted">{current.subtitle}</p>
            </div>

            {current.key === 'role' && (
              <RolePicker roles={roles} isEditing onToggle={toggleRole} />
            )}

            {current.key === 'profile' && (
              <>
                <div className="flex items-center gap-4">
                  <button
                    type="button" onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 rounded-full shrink-0 border-none cursor-pointer overflow-hidden bg-surface-2 flex items-center justify-center"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={22} color="var(--text-muted)" />
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 size={18} color="#fff" className="animate-spin" />
                      </div>
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChosen} />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Profile photo</p>
                    <p className="text-xs text-text-muted">Optional — click to upload</p>
                  </div>
                </div>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  placeholder="Tell the community about yourself…"
                  className={textareaCls}
                />
                <div className="flex gap-2">
                  <input
                    value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country"
                    className={inputCls}
                  />
                  <input
                    value={age}
                    onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                    placeholder="Age"
                    inputMode="numeric"
                    className={`${inputCls} max-w-[90px]`}
                  />
                </div>
                <p className="text-xs text-text-muted m-0">
                  Location and age help us recommend posts from people near you and around your age.
                </p>
              </>
            )}

            {current.key === 'skills' && (
              <SkillInput skills={skills} onAdd={addSkill} onRemove={removeSkill} />
            )}

            {current.key === 'background' && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Current / recent role</p>
                  <input value={experience.title} onChange={(e) => setExperience({ ...experience, title: e.target.value })} placeholder="Job title" className={inputCls} />
                  <input value={experience.company} onChange={(e) => setExperience({ ...experience, company: e.target.value })} placeholder="Company" className={inputCls} />
                  <div className="flex gap-2">
                    <input value={experience.startDate} onChange={(e) => setExperience({ ...experience, startDate: e.target.value })} placeholder="Start (YYYY-MM)" className={inputCls} />
                    <input value={experience.endDate} onChange={(e) => setExperience({ ...experience, endDate: e.target.value })} placeholder="End (or leave blank)" className={inputCls} />
                  </div>
                  <textarea value={experience.description} onChange={(e) => setExperience({ ...experience, description: e.target.value })} rows={2} placeholder="Brief description…" className={textareaCls} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Education</p>
                  <input value={education.institution} onChange={(e) => setEducation({ ...education, institution: e.target.value })} placeholder="Institution" className={inputCls} />
                  <div className="flex gap-2">
                    <input value={education.degree} onChange={(e) => setEducation({ ...education, degree: e.target.value })} placeholder="Degree" className={inputCls} />
                    <input value={education.field} onChange={(e) => setEducation({ ...education, field: e.target.value })} placeholder="Field of study" className={inputCls} />
                  </div>
                  <input value={education.graduationYear} onChange={(e) => setEducation({ ...education, graduationYear: e.target.value })} placeholder="Graduation year" className={inputCls} />
                </div>
              </>
            )}

            {current.key === 'social' && (
              <SocialLinks links={socialLinks} isEditing onChange={updateSocialLink} />
            )}

            {error && <p className="text-[13px] text-error m-0">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-2 px-5.5 py-4 border-t border-divider shrink-0">
            <button
              type="button" onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
              className={`flex items-center gap-1 min-h-11 px-4 py-2 rounded-[9px] border-[1.5px] border-border bg-transparent text-text-secondary text-sm font-medium ${step === 0 ? 'opacity-0 pointer-events-none' : 'cursor-pointer'}`}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <motion.button
              type="button" whileTap={{ scale: 0.97 }} disabled={saving}
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className={`flex items-center gap-[7px] min-h-11 px-5.5 py-2 rounded-[9px] border-none text-white text-sm font-semibold ${saving ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ background: 'var(--accent)' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : !isLast && <ChevronRight size={14} />}
              {saving ? 'Saving…' : isLast ? 'Finish' : 'Next'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {cropFile && (
          <ImageCropper
            file={cropFile}
            aspect={1}
            shape="round"
            label="Profile Photo"
            onComplete={onCropComplete}
            onCancel={() => setCropFile(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
