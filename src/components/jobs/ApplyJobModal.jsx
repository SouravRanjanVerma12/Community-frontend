import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Upload, Link2, CheckCircle, Loader2, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';

const JC = '#1e9df1';

const fieldClasses = 'w-full px-3.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 box-border focus:border-[#1e9df1]';

export default function ApplyJobModal({ job, onClose }) {
  const [coverNote,    setCoverNote]    = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeFile,   setResumeFile]   = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState('');
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setResumeFile(f);
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coverNote.trim()) return;
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('coverNote',    coverNote.trim());
      fd.append('portfolioUrl', portfolioUrl.trim());
      if (resumeFile) {
        setUploading(true);
        fd.append('resume', resumeFile);
      }
      await api.post(`/jobs/${job._id}/apply`, fd);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to submit application.');
    } finally {
      setSubmitting(false);
      setUploading(false);
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
        className="w-full max-w-[520px] bg-card rounded-[18px] overflow-hidden"
        style={{ border: `1px solid ${JC}35`, boxShadow: `0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px ${JC}20` }}
      >
        {/* Header */}
        <div className="px-[22px] pt-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-[7px] mb-1">
              <Briefcase size={16} color={JC} />
              <h2 className="text-base font-bold text-text-primary">Apply for this role</h2>
            </div>
            <p className="text-[13px] text-text-muted max-w-[380px]">
              {job.title} · {job.company}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border-none bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Success state */}
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="px-[22px] py-10 text-center">
            <CheckCircle size={48} color="#22c55e" className="mb-4" />
            <h3 className="text-lg font-bold text-text-primary mb-2">Application sent!</h3>
            <p className="text-sm text-text-muted mb-6">
              The poster will review your application and get back to you.
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
          <form onSubmit={handleSubmit} className="px-[22px] pt-4 pb-[22px] flex flex-col gap-3.5">

            {/* Cover note */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                Cover note <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={coverNote} onChange={(e) => setCoverNote(e.target.value)} required rows={4}
                placeholder="Tell them why you're a good fit for this role…"
                className={`${fieldClasses} py-[11px] leading-[1.6] resize-y font-[inherit]`}
              />
              <p className="text-[11px] text-text-muted mt-1">{coverNote.length}/500</p>
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                <Link2 size={13} className="align-middle mr-1" />
                Portfolio / LinkedIn URL <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <input
                value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname or https://yoursite.com"
                className={`${fieldClasses} py-2.5`}
              />
            </div>

            {/* Resume upload */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                <FileText size={13} className="align-middle mr-1" />
                Resume / CV <span className="font-normal text-text-muted">(optional — PDF, max 5 MB)</span>
              </label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFile} />
              {resumeFile ? (
                <div
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px]"
                  style={{ border: `1.5px solid ${JC}50`, background: `${JC}0a` }}
                >
                  <FileText size={16} color={JC} />
                  <span className="text-[13px] font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: JC }}>{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)} className="bg-none border-none cursor-pointer text-text-muted"><X size={14} /></button>
                </div>
              ) : (
                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-[13px] cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 hover:text-[#1e9df1] hover:border-[#1e9df1]"
                >
                  <Upload size={14} /> Click to upload resume
                </button>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-[#dc2626] m-0">{error}</motion.p>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px bg-divider" />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <motion.button
                type="submit" whileTap={{ scale: 0.97 }} disabled={!coverNote.trim() || submitting}
                className={`flex items-center gap-[7px] px-[22px] py-[9px] rounded-[9px] border-none text-white text-sm font-semibold transition-colors duration-150 ${coverNote.trim() ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{ background: !coverNote.trim() ? `${JC}40` : JC }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Briefcase size={14} />}
                {uploading ? 'Uploading…' : submitting ? 'Sending…' : 'Submit Application'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
