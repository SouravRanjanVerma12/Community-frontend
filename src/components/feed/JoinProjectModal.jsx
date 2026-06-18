import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users2, Upload, Link2, CheckCircle, Loader2, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';

const COLLAB_COLOR = '#0891b2';

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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', background: 'var(--card-bg)', borderRadius: '18px', border: `1px solid ${COLLAB_COLOR}35`, boxShadow: `0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px ${COLLAB_COLOR}20`, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '20px 22px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
              <Users2 size={16} color={COLLAB_COLOR} />
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Join this project</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px' }}>
              {post.projectName || post.title}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Success state */}
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ padding: '40px 22px', textAlign: 'center' }}>
            <CheckCircle size={48} color="#22c55e" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Request sent!</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              The project owner will review your application and get back to you.
            </p>
            <button onClick={onClose}
              style={{ padding: '10px 28px', borderRadius: '10px', border: 'none', background: COLLAB_COLOR, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              Done
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '16px 22px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Why */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Why do you want to join? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea value={why} onChange={(e) => setWhy(e.target.value)} required rows={4}
                placeholder="Tell the creator what excites you about this project and what you can contribute…"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{why.length}/500</p>
            </div>

            {/* Expertise */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Relevant experience & expertise
              </label>
              <textarea value={expertise} onChange={(e) => setExpertise(e.target.value)} rows={3}
                placeholder="Share your skills, past projects, or anything relevant to this collab…"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6', resize: 'vertical', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Portfolio URL */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                <Link2 size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Portfolio / GitHub URL <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname or https://yoursite.com"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '14px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = COLLAB_COLOR)}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
            </div>

            {/* Resume upload */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                <FileText size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Resume / CV <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(optional — PDF, max 5 MB)</span>
              </label>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,image/*" style={{ display: 'none' }} onChange={handleFile} />
              {resumeFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${COLLAB_COLOR}50`, background: `${COLLAB_COLOR}0a` }}>
                  <FileText size={16} color={COLLAB_COLOR} />
                  <span style={{ fontSize: '13px', color: COLLAB_COLOR, fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'border-color 0.15s, color 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = COLLAB_COLOR; e.currentTarget.style.color = COLLAB_COLOR; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                  <Upload size={14} /> Click to upload resume
                </button>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ fontSize: '13px', color: '#dc2626', margin: 0 }}>{error}</motion.p>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--divider)' }} />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose}
                style={{ padding: '9px 18px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
                Cancel
              </button>
              <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={!why.trim() || submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 22px', borderRadius: '9px', border: 'none', background: !why.trim() ? `${COLLAB_COLOR}40` : COLLAB_COLOR, color: '#fff', fontSize: '14px', fontWeight: '600', cursor: why.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.15s' }}>
                {submitting ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Users2 size={14} />}
                {uploading ? 'Uploading…' : submitting ? 'Sending…' : 'Send Request'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>,
    document.body
  );
}
