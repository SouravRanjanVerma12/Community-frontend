import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UploadCloud, PenLine, ArrowLeft, ChevronDown, HelpCircle, Check,
} from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/authStore';
import { SkillInput, DomainPicker } from '../About/UserAbout';
import Button from '../ui/Button';

const EXPORT_STEPS = [
  'Sign in at linkedin.com and click your profile photo ("Me") in the top nav.',
  'Choose "Settings & Privacy".',
  'Open the "Data privacy" tab, then click "Get a copy of your data".',
  'Pick "Want something in particular?" and select at least Profile, Positions, Education, and Skills — or choose the full archive.',
  'Click "Request archive". LinkedIn emails you a download link, usually within 10 minutes (can take up to 24 hours).',
  'Download the .zip from that email, then upload it below.',
];

const MIN_SKILLS = 3;
const fieldCls = 'px-3.5 py-[11px] rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 focus:border-accent-border w-full';

function ExportGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-text-secondary cursor-pointer"
      >
        <HelpCircle size={15} className="shrink-0 text-text-muted" />
        <span className="flex-1 text-left">Where do I get this file?</span>
        <ChevronDown
          size={15}
          className="shrink-0 text-text-muted transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ol className="px-4 pb-3.5 pt-0.5 flex flex-col gap-1.5 text-[13px] text-text-secondary leading-snug list-decimal list-outside ml-4">
              {EXPORT_STEPS.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceCard({ icon: Icon, title, description, cta, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group text-left w-full border-[1.5px] border-border rounded-2xl px-4.5 py-4 flex flex-col gap-2.5 bg-transparent cursor-pointer transition-colors duration-150 hover:border-accent hover:bg-accent-bg/40"
    >
      <div className="w-9 h-9 rounded-full bg-accent-bg border border-accent-border flex items-center justify-center text-accent">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-[15px] font-bold text-text-primary mb-0.5">{title}</p>
        <p className="text-[13px] text-text-secondary leading-relaxed">{description}</p>
      </div>
      <span className="text-[13px] font-semibold text-accent mt-0.5">{cta} →</span>
    </button>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-text-secondary">Profile completeness</span>
        <span className="text-[13px] font-bold text-accent">{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-(image:--btn-grad)"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function ManualFillForm({ onClose, onBack }) {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [bio, setBio] = useState(user?.bio ?? '');
  const [expTitle, setExpTitle] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expStart, setExpStart] = useState('');
  const [expEnd, setExpEnd] = useState('');
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [skills, setSkills] = useState(user?.skills ?? []);
  const [domain, setDomain] = useState(user?.domain ?? []);
  const [saving, setSaving] = useState(false);

  const percent = useMemo(() => {
    const bioScore = bio.trim() ? 1 : 0;
    const expScore = (expTitle.trim() ? 0.5 : 0) + (expCompany.trim() ? 0.5 : 0);
    const eduScore = (eduInstitution.trim() ? 0.5 : 0) + (eduDegree.trim() ? 0.5 : 0);
    const skillsScore = Math.min(skills.length, MIN_SKILLS) / MIN_SKILLS;
    return Math.round(((bioScore + expScore + eduScore + skillsScore) / 4) * 100);
  }, [bio, expTitle, expCompany, eduInstitution, eduDegree, skills]);

  const complete = percent === 100;

  const handleSave = async () => {
    setSaving(true);
    try {
      const experience = expTitle.trim() && expCompany.trim()
        ? [...(user?.experience ?? []), { title: expTitle.trim(), company: expCompany.trim(), startDate: expStart, endDate: expEnd, description: '' }]
        : (user?.experience ?? []);
      const education = eduInstitution.trim() && eduDegree.trim()
        ? [...(user?.education ?? []), { institution: eduInstitution.trim(), degree: eduDegree.trim(), field: eduField.trim(), graduationYear: '' }]
        : (user?.education ?? []);

      const { data } = await api.patch('/users/profile', { bio, experience, education, skills, domain });
      setUser(data.user);

      if (data.user?.profileCompleted) {
        toast.success('Profile complete — you can now post, apply, and join collabs.');
        if (onClose) onClose();
      } else {
        toast.success(`Progress saved — ${percent}% complete.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted cursor-pointer mb-3 bg-transparent border-none p-0 hover:text-text-secondary"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h2 className="text-xl font-bold text-text-primary mb-2">Fill in your profile</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Add a short bio, one role, one degree, and a few skills to unlock posting, jobs, and collabs.
        </p>
      </div>

      <ProgressBar percent={percent} />

      <div className="flex flex-col gap-3 max-h-[42vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-secondary">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            placeholder="Tell the community about yourself…"
            className={`${fieldCls} resize-y font-[inherit]`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-secondary">Experience</label>
          <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="Job title" className={fieldCls} />
          <input value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="Company" className={fieldCls} />
          <div className="flex gap-2">
            <input value={expStart} onChange={(e) => setExpStart(e.target.value)} placeholder="Start (YYYY-MM)" className={fieldCls} />
            <input value={expEnd} onChange={(e) => setExpEnd(e.target.value)} placeholder="End (or leave blank)" className={fieldCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-secondary">Education</label>
          <input value={eduInstitution} onChange={(e) => setEduInstitution(e.target.value)} placeholder="Institution" className={fieldCls} />
          <div className="flex gap-2">
            <input value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} placeholder="Degree" className={fieldCls} />
            <input value={eduField} onChange={(e) => setEduField(e.target.value)} placeholder="Field of study" className={fieldCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-secondary">
            Skills <span className="text-text-muted font-normal">(at least {MIN_SKILLS})</span>
          </label>
          <SkillInput
            skills={skills}
            onAdd={(s) => setSkills((prev) => (prev.includes(s) ? prev : [...prev, s]))}
            onRemove={(s) => setSkills((prev) => prev.filter((x) => x !== s))}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-text-secondary">
            Domain <span className="text-text-muted font-normal">(optional — you can add this later in your profile)</span>
          </label>
          <DomainPicker
            domain={domain}
            isEditing
            onToggle={(d) => setDomain((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onClose && (
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Save & finish later
          </Button>
        )}
        <Button onClick={handleSave} isLoading={saving} disabled={percent === 0}>
          {complete ? (<><Check size={14} /> Complete profile</>) : 'Save progress'}
        </Button>
      </div>
    </>
  );
}

export default function OnboardingModal({ onClose }) {
  const [step, setStep] = useState('choice'); // 'choice' | 'zip' | 'manual'
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith('.zip')) {
      setFile(selected);
    } else if (selected) {
      toast.error('Please select a valid .zip file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append('file', file);

    try {
      const { data } = await api.post('/users/linkedin-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.user);
      toast.success('LinkedIn data imported successfully.');
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process the ZIP file. Please ensure it is the correct export from LinkedIn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="w-full max-w-[480px] bg-card rounded-[24px] shadow-2xl border border-border/50 p-6 flex flex-col gap-5"
      >
        {step === 'choice' && (
          <>
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Complete your profile</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                To maintain high signal quality in the hub, we require a verified professional
                background before you can post, apply, or join collabs. Choose how you'd like to add yours.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <ChoiceCard
                icon={UploadCloud}
                title="Import your LinkedIn data"
                description="Fastest option — upload your official LinkedIn data export and we'll fill in your headline, skills, and experience automatically."
                cta="Import ZIP"
                onClick={() => setStep('zip')}
              />
              <ChoiceCard
                icon={PenLine}
                title="Fill it in manually"
                description="Add your bio, at least one role, one degree, and a few skills yourself — right here."
                cta="Fill manually"
                onClick={() => setStep('manual')}
              />
            </div>

            {onClose && (
              <div className="flex justify-end pt-1">
                <Button variant="ghost" onClick={onClose}>
                  Not now
                </Button>
              </div>
            )}
          </>
        )}

        {step === 'manual' && (
          <ManualFillForm onClose={onClose} onBack={() => setStep('choice')} />
        )}

        {step === 'zip' && (
          <>
            <div>
              <button
                type="button"
                onClick={() => setStep('choice')}
                className="flex items-center gap-1.5 text-[13px] font-medium text-text-muted cursor-pointer mb-3 bg-transparent border-none p-0 hover:text-text-secondary"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="text-xl font-bold text-text-primary mb-2">Import your Professional Data</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Request a data archive containing your Profile, Education, Skills, and Positions from your LinkedIn settings, then upload the .zip here.
              </p>
            </div>

            <ExportGuide />

            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center text-center">
              <UploadCloud className="text-text-muted mb-3" size={36} />
              <p className="text-sm text-text-primary font-medium mb-1">
                {file ? file.name : 'Upload LinkedIn Data Export (.zip)'}
              </p>
              <p className="text-xs text-text-muted mb-4 max-w-[280px]">
                Request a data archive containing your Profile, Education, Skills, and Positions from your LinkedIn settings.
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <span className="inline-flex items-center justify-center h-10 px-4 bg-input border border-border rounded-lg text-sm font-medium hover:bg-hover transition-colors">
                  Select ZIP file
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {onClose && (
                <Button variant="ghost" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleUpload} isLoading={loading} disabled={!file}>
                Import Data
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
