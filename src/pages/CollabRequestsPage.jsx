import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, X, Loader2, ExternalLink,
  FileText, Globe, Users2, ClipboardList,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axiosInstance';

const COLLAB_COLOR = '#0891b2';

const STATUS_STYLES = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)', label: 'Pending'  },
  accepted: { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)',  label: 'Accepted' },
  rejected: { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
};

const TABS = ['all', 'pending', 'accepted', 'rejected'];

function Avatar({ name, src, size = 44 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid var(--border)' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', flexShrink: 0, border: '3px solid var(--border)', userSelect: 'none' }}>
      {initials}
    </div>
  );
}

function ApplicantCard({ req, onUpdate }) {
  const [status, setStatus] = useState(req.status);
  const [acting, setActing] = useState(null); // 'accepted' | 'rejected'
  const s = STATUS_STYLES[status];

  const respond = async (newStatus) => {
    setActing(newStatus);
    try {
      await api.patch(`/collab-requests/${req._id}`, { status: newStatus });
      setStatus(newStatus);
      onUpdate?.();
    } finally {
      setActing(null);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '14px', padding: '20px 22px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header: avatar + name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
        <Link to={`/profile/${req.requester._id}`} style={{ flexShrink: 0 }}>
          <Avatar name={req.requester.name} src={req.requester.avatarUrl} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <Link to={`/profile/${req.requester._id}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{req.requester.name}</span>
            </Link>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>@{req.requester.username}</span>
            <span style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
              background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            }}>
              {s.label}
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {req.portfolioUrl && (
              <a href={req.portfolioUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: COLLAB_COLOR, textDecoration: 'none', fontWeight: '500' }}>
                <Globe size={12} /> Portfolio
              </a>
            )}
            {req.resumeUrl && (
              <a href={req.resumeUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: COLLAB_COLOR, textDecoration: 'none', fontWeight: '500' }}>
                <FileText size={12} /> Resume / CV
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        {status === 'pending' && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => respond('accepted')} disabled={!!acting}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', borderRadius: '9px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
              {acting === 'accepted' ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={13} />}
              Accept
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => respond('rejected')} disabled={!!acting}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '9px', border: '1.5px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              {acting === 'rejected' ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <X size={13} />}
              Reject
            </motion.button>
          </div>
        )}
        {status === 'accepted' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '9px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <Check size={14} color="#16a34a" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>Accepted</span>
          </div>
        )}
        {status === 'rejected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <X size={13} color="#dc2626" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626' }}>Rejected</span>
            </div>
            <button onClick={() => respond('accepted')}
              style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Undo
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--divider)', marginBottom: '14px' }} />

      {/* Why */}
      <div style={{ marginBottom: req.expertise ? '12px' : '0' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
          Why they want to join
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
          "{req.why}"
        </p>
      </div>

      {/* Expertise */}
      {req.expertise && (
        <div style={{ marginTop: '12px', padding: '12px 14px', borderRadius: '10px', background: 'var(--surface-2)' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            Experience & expertise
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {req.expertise}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function CollabRequestsPage() {
  const { postId } = useParams();
  const [post,     setPost]     = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [tab,      setTab]      = useState('all');

  const load = async () => {
    try {
      const [postRes, reqRes] = await Promise.all([
        api.get(`/posts/${postId}`).catch(() => ({ data: { post: null } })),
        api.get(`/posts/${postId}/requests`),
      ]);
      setPost(postRes.data.post ?? postRes.data);
      setRequests(reqRes.data.requests);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [postId]); // eslint-disable-line

  const filtered = tab === 'all' ? requests : requests.filter((r) => r.status === tab);

  const counts = {
    all:      requests.length,
    pending:  requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Back */}
        <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '20px' }}>
          <ArrowLeft size={14} /> Back to Explore
        </Link>

        {/* Page header */}
        <div style={{ background: 'var(--card-bg)', border: `1px solid ${COLLAB_COLOR}35`, borderRadius: '14px', padding: '20px 22px', marginBottom: '20px', boxShadow: `0 2px 12px ${COLLAB_COLOR}12` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ClipboardList size={18} color={COLLAB_COLOR} />
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Applications
            </h1>
          </div>
          {post && (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              for <span style={{ color: COLLAB_COLOR, fontWeight: '600' }}>{post.projectName || post.title}</span>
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    val: counts.all,      color: COLLAB_COLOR      },
              { label: 'Pending',  val: counts.pending,  color: '#d97706'         },
              { label: 'Accepted', val: counts.accepted, color: '#16a34a'         },
              { label: 'Rejected', val: counts.rejected, color: 'var(--text-muted)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center', minWidth: '52px' }}>
                <p style={{ fontSize: '22px', fontWeight: '800', color, margin: 0 }}>{val}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', overflow: 'hidden' }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '8px', borderRadius: '9px', border: 'none',
                background: tab === t ? COLLAB_COLOR : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: tab === t ? '700' : '500',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}>
              {t}
              {counts[t] > 0 && (
                <span style={{
                  padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: '700',
                  background: tab === t ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                }}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Loader2 size={28} color={COLLAB_COLOR} style={{ animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#dc2626', fontSize: '14px' }}>
            <p style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</p>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Users2 size={40} color="var(--text-faint)" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {tab === 'all' ? 'No applications yet' : `No ${tab} applications`}
            </p>
            <p style={{ fontSize: '13px' }}>
              {tab === 'all' ? 'Share your collab post to attract collaborators.' : `Switch tabs to see other applications.`}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((req) => (
                <ApplicantCard key={req._id} req={req} onUpdate={load} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
