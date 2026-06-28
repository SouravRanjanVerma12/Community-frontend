import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Loader2, CheckCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';
import { invalidateJobs } from '../../hooks/useJobs';

const JC = '#1e9df1';

const fieldClasses = 'w-full px-3.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 box-border focus:border-[#1e9df1]';

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time',  label: 'Full-time'  },
  { value: 'part-time',  label: 'Part-time'  },
  { value: 'contract',   label: 'Contract'   },
  { value: 'internship', label: 'Internship' },
];

export default function PostJobModal({ onClose }) {
  const [title,          setTitle]          = useState('');
  const [company,        setCompany]        = useState('');
  const [location,       setLocation]       = useState('');
  const [workMode,       setWorkMode]       = useState('remote');
  const [employmentType, setEmploymentType] = useState('full-time');
  const [description,    setDescription]    = useState('');
  const [skills,         setSkills]         = useState('');
  const [salaryRange,    setSalaryRange]    = useState('');
  const [submitting,     setSubmitting]     = useState(false);
  const [done,           setDone]           = useState(false);
  const [error,          setError]          = useState('');

  const valid = title.trim() && company.trim() && description.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true); setError('');
    try {
      await api.post('/jobs', {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        description: description.trim(),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        salaryRange: salaryRange.trim(),
      });
      invalidateJobs();
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-300 bg-black/45 backdrop-blur-[5px] flex items-center justify-center p-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[560px] max-h-[90svh] overflow-y-auto bg-card rounded-[18px]"
        style={{ border: `1px solid ${JC}35`, boxShadow: `0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px ${JC}20` }}
      >
        {/* Header */}
        <div className="px-[22px] pt-5 flex items-start justify-between gap-3 sticky top-0 bg-card pb-3">
          <div className="flex items-center gap-[7px]">
            <Briefcase size={16} color={JC} />
            <h2 className="text-base font-bold text-text-primary">Post a job</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border-none bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary shrink-0">
            <X size={14} />
          </button>
        </div>

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-[22px] py-10 text-center">
            <CheckCircle size={48} color="#22c55e" className="mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">Job posted!</h3>
            <p className="text-sm text-text-muted mb-6">
              It's now live in the Jobs Discover tab.
            </p>
            <button
              onClick={onClose}
              className="px-7 py-2.5 rounded-[10px] border-none text-white text-sm font-semibold cursor-pointer"
              style={{ background: JC }}
            >
              Done
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="px-[22px] pt-1 pb-[22px] flex flex-col gap-3.5">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                  Job title <span className="text-[#ef4444]">*</span>
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required
                  placeholder="Senior Frontend Engineer" className={`${fieldClasses} py-2.5`} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                  Company <span className="text-[#ef4444]">*</span>
                </label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} required
                  placeholder="Your company" className={`${fieldClasses} py-2.5`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bangalore, India" className={`${fieldClasses} py-2.5`} />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Salary range</label>
                <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. 15-25 LPA, or Competitive" className={`${fieldClasses} py-2.5`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Work mode</label>
                <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={`${fieldClasses} py-2.5`}>
                  {WORK_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Employment type</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={`${fieldClasses} py-2.5`}>
                  {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                Job description <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)} required rows={6}
                placeholder="Responsibilities, requirements, what makes this role great…"
                className={`${fieldClasses} py-[11px] leading-[1.6] resize-y font-[inherit]`}
              />
            </div>

            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                Required skills <span className="font-normal text-text-muted">(comma separated)</span>
              </label>
              <input value={skills} onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, MongoDB" className={`${fieldClasses} py-2.5`} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-[#dc2626] m-0">{error}</motion.p>
              )}
            </AnimatePresence>

            <div className="h-px bg-divider" />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <motion.button
                type="submit" whileTap={{ scale: 0.97 }} disabled={!valid || submitting}
                className={`flex items-center gap-[7px] px-[22px] py-[9px] rounded-[9px] border-none text-white text-sm font-semibold transition-colors duration-150 ${valid ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{ background: !valid ? `${JC}40` : JC }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Briefcase size={14} />}
                {submitting ? 'Posting…' : 'Post Job'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
