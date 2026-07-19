import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users2, Upload, Link2, CheckCircle, Loader2, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';

const fieldClasses = 'w-full px-3.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 box-border focus:border-accent';

export default function JoinProjectModal({ post, onClose }) {
  const [why,          setWhy]          = useState('');
  const [expertise,    setExpertise]    = useState('');
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
    if (!why.trim()) return;
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      fd.append('why',          why.trim());
      fd.append('expertise',    expertise.trim());
      fd.append('portfolioUrl', portfolioUrl.trim());
      if (resumeFile) {
        setUploading(true);
        fd.append('resume', resumeFile);
      }
      await api.post(`/posts/${post._id}/join`, fd);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to send request.');
    } finally {
      setSubmitting(false);
      setUploading(false);
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
        onClick={() => onClose(false)}
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
          className="w-full max-w-[520px] max-h-[90svh] overflow-y-auto scrollbar-none bg-card rounded-[24px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)] border border-border/50"
        >
          {/* Header */}
          <motion.div layout="position" className="px-7 pt-7 pb-3 flex items-start justify-between gap-4 sticky top-0 bg-card z-10 border-b border-border/40">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users2 size={18} className="text-accent" />
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">Join this project</h2>
              </div>
              <p className="text-[13px] text-text-muted max-w-[380px]">
                {post.projectName || post.title}
              </p>
            </div>
            <button 
              onClick={() => onClose(false)} 
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
            <h3 className="text-xl font-bold tracking-tight text-text-primary mb-2">Request Sent!</h3>
            <p className="text-[15px] text-text-muted max-w-[320px] mb-8 leading-relaxed">
              The project owner will review your application and get back to you.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onClose(true)}
              className="px-8 py-3 rounded-full bg-accent text-white text-[15px] font-medium shadow-[0_4px_12px_var(--accent-light)] hover:shadow-[0_6px_16px_var(--accent-light)] transition-shadow"
            >
              Done
            </motion.button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="px-7 pt-4 pb-7 flex flex-col gap-4">

            {/* Why */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                Why do you want to join? <span className="text-[#ef4444]">*</span>
              </label>
              <textarea
                value={why} onChange={(e) => setWhy(e.target.value)} required rows={4}
                placeholder="Tell the creator what excites you about this project and what you can contribute…"
                className={`${fieldClasses} py-[11px] leading-[1.6] resize-y font-[inherit]`}
              />
              <p className="text-[11px] text-text-muted mt-1">{why.length}/500</p>
            </div>

            {/* Expertise */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                Relevant experience & expertise
              </label>
              <textarea
                value={expertise} onChange={(e) => setExpertise(e.target.value)} rows={3}
                placeholder="Share your skills, past projects, or anything relevant to this collab…"
                className={`${fieldClasses} py-[11px] leading-[1.6] resize-y font-[inherit]`}
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                <Link2 size={13} className="align-middle mr-1" />
                Portfolio / GitHub URL <span className="font-normal text-text-muted">(optional)</span>
              </label>
              <input
                value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname or https://yoursite.com"
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
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] border border-accent/20 bg-accent/5"
                >
                  <FileText size={16} className="text-accent" />
                  <span className="text-[13px] font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-accent">{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)} className="bg-none border-none cursor-pointer text-text-muted hover:text-text-primary transition-colors"><X size={14} /></button>
                </div>
              ) : (
                <button
                  type="button" onClick={() => fileRef.current?.click()}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-[13px] cursor-pointer flex items-center justify-center gap-2 transition-colors duration-150 hover:text-accent hover:border-accent"
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
              <Button type="button" variant="ghost" size="sm" onClick={() => onClose(false)}>
                Cancel
              </Button>
              <motion.button
                type="submit" whileTap={{ scale: 0.97 }} disabled={!why.trim() || submitting}
                className={`flex items-center gap-[7px] px-[22px] py-[9px] rounded-[9px] border-none text-white text-sm font-semibold transition-colors duration-150 ${why.trim() ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                style={{ background: !why.trim() ? 'var(--accent-light)' : 'var(--accent)' }}
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Users2 size={14} />}
                {uploading ? 'Uploading…' : submitting ? 'Sending…' : 'Send Request'}
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
