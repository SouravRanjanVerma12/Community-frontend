import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Upload, Link2, Loader2, FileText, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner'; // We'll use our newly upgraded geometry spinner here too!

const fieldClasses = 'w-full px-4 rounded-[12px] border border-border/50 bg-input/50 text-[14px] text-text-primary outline-none transition-all duration-300 box-border focus:bg-input focus:border-accent focus:shadow-[0_0_0_2px_var(--accent-light)]';

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
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => onClose(false)}
        className="fixed inset-0 z-300 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-5"
      >
        <motion.div
          key="modal-card"
          layout
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 140, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[540px] max-h-[92vh] sm:max-h-[88vh] overflow-y-auto scrollbar-none bg-card rounded-t-[28px] sm:rounded-[24px] overflow-hidden shadow-[0_-12px_40px_rgba(0,0,0,0.4)] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)] border-t sm:border border-border/50"
        >
          {/* Mobile handle indicator */}
          <div className="w-10 h-1 rounded-full bg-border/80 mx-auto mt-2.5 sm:hidden shrink-0" />

          {/* Header */}
          <motion.div layout="position" className="px-5 sm:px-7 pt-4 sm:pt-7 pb-2 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase size={18} className="text-accent" />
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">Apply for this role</h2>
              </div>
              <p className="text-[14px] text-text-muted">
                {job.title} <span className="mx-1.5 opacity-50">•</span> {job.company}
              </p>
            </div>
            <button 
              onClick={() => onClose(false)} 
              className="w-8 h-8 rounded-full border border-border/50 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary shrink-0 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>

          {/* Success state */}
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div 
                key="success-view"
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 150, damping: 15 }}
                className="px-7 py-14 text-center flex flex-col items-center"
              >
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center bg-green-500/10 rounded-full">
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </motion.svg>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-text-primary mb-2">Application Sent</h3>
                <p className="text-[15px] text-text-muted max-w-[320px] mb-8 leading-relaxed">
                  Your profile has been forwarded to the hiring team. They will review it and get back to you shortly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onClose(true)}
                  className="px-8 py-3 rounded-full bg-accent text-white text-[15px] font-medium shadow-[0_4px_12px_var(--accent-light)] hover:shadow-[0_6px_16px_var(--accent-light)] transition-shadow"
                >
                  Return to Jobs
                </motion.button>
              </motion.div>
            ) : (
              <motion.form 
                key="form-view"
                layout="position"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="px-7 pt-4 pb-7 flex flex-col gap-5"
              >
                {/* Cover note */}
                <motion.div layout="position">
                  <label className="text-[13px] font-medium tracking-wide text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                    Cover Note <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={coverNote} onChange={(e) => setCoverNote(e.target.value)} required rows={4}
                    placeholder="Tell them why you're a good fit for this role..."
                    className={`${fieldClasses} py-3.5 leading-relaxed resize-none`}
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className={`text-[12px] font-mono ${coverNote.length > 500 ? 'text-red-400' : 'text-text-muted'}`}>
                      {coverNote.length}/500
                    </span>
                  </div>
                </motion.div>

                {/* Portfolio URL */}
                <motion.div layout="position">
                  <label className="text-[13px] font-medium tracking-wide text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                    <Link2 size={14} /> Portfolio / LinkedIn <span className="font-normal text-text-muted normal-case ml-1">(optional)</span>
                  </label>
                  <input
                    value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yoursite.com or linkedin.com/in/you"
                    className={`${fieldClasses} py-3`}
                  />
                </motion.div>

                {/* Resume upload */}
                <motion.div layout="position">
                  <label className="text-[13px] font-medium tracking-wide text-text-secondary uppercase mb-2 flex items-center gap-1.5">
                    <FileText size={14} /> Resume / CV <span className="font-normal text-text-muted normal-case ml-1">(optional)</span>
                  </label>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" className="hidden" onChange={handleFile} />
                  
                  <AnimatePresence mode="wait">
                    {resumeFile ? (
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-[12px] border border-accent/30 bg-accent/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                          <FileText size={16} className="text-accent" />
                        </div>
                        <span className="text-[14px] font-medium text-text-primary flex-1 truncate">{resumeFile.name}</span>
                        <button 
                          type="button" onClick={() => setResumeFile(null)} 
                          className="w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-text-muted"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="upload-btn"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        type="button" onClick={() => fileRef.current?.click()}
                        className="w-full px-4 py-6 rounded-[12px] border-2 border-dashed border-border/60 bg-surface-1/50 text-text-muted hover:bg-surface-2 hover:border-accent/50 hover:text-accent transition-all duration-300 flex flex-col items-center justify-center gap-2 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                          <Upload size={18} className="text-text-secondary group-hover:text-accent transition-colors" />
                        </div>
                        <span className="text-[14px] font-medium">Click to browse or drag file here</span>
                        <span className="text-[12px] opacity-70">PDF, DOCX up to 5MB</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="text-[13px] text-red-400 bg-red-400/10 px-4 py-3 rounded-lg border border-red-400/20 mt-2">
                        {error}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <motion.div layout="position" className="h-px bg-border/40 my-1" />

                {/* Actions */}
                <motion.div layout="position" className="flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <motion.button
                    whileHover={!submitting && coverNote.trim() ? { scale: 1.02 } : {}}
                    whileTap={!submitting && coverNote.trim() ? { scale: 0.98 } : {}}
                    type="submit" 
                    disabled={!coverNote.trim() || submitting}
                    className={`
                      relative overflow-hidden flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] 
                      text-[14.5px] font-semibold transition-all duration-300 shadow-[0_4px_12px_var(--accent-light)]
                      ${coverNote.trim() ? 'bg-accent text-white cursor-pointer hover:shadow-[0_6px_16px_var(--accent-light)]' : 'bg-surface-2 text-text-muted cursor-not-allowed shadow-none'}
                    `}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center w-5 h-5">
                        <Spinner size="sm" color="#fff" />
                      </div>
                    ) : (
                      <Check size={16} />
                    )}
                    <span>{uploading ? 'Uploading...' : submitting ? 'Sending...' : 'Submit Application'}</span>
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
