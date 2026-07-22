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
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
        className="fixed inset-0 z-300 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
      >
        <motion.div
          key="modal-card"
          layout
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[560px] max-h-[90svh] overflow-y-auto scrollbar-none bg-card rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)] border border-border/50"
        >
        {/* Header */}
        <motion.div layout="position" className="px-7 pt-7 pb-3 flex items-start justify-between gap-4 sticky top-0 bg-card z-10 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">Post a job</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full border border-border/50 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>

        {done ? (
          <motion.div 
            key="success-view"
            layout="position"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="px-7 py-16 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
              <motion.svg
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </motion.svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-text-primary mb-2">Job Posted</h3>
            <p className="text-[15px] text-text-muted max-w-[320px] mb-8 leading-relaxed">
              Your job posting is now live in the Jobs Discover tab.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-accent text-white text-[15px] font-medium shadow-[0_4px_12px_var(--accent-light)] hover:shadow-[0_6px_16px_var(--accent-light)] transition-shadow"
            >
              Done
            </motion.button>
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
    </motion.div>
    </AnimatePresence>,
    document.body
  );
}
