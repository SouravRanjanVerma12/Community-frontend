import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Check, X, Loader2,
  FileText, Globe, Users2, ClipboardList, AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axiosInstance';
import { usePost } from '../hooks/usePosts';
import { useCollabRequesters } from '../hooks/useCollabRequests';
import { queryClient } from '../api/queryClient';

const COLLAB_COLOR = '#3a3d4a';

const STATUS_STYLES = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)', label: 'Pending'  },
  accepted: { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)',  label: 'Accepted' },
  rejected: { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
};

const TABS = ['all', 'pending', 'accepted', 'rejected'];

function Avatar({ name, src, size = 44 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0 border-[3px] border-border" />;
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold shrink-0 border-[3px] border-border select-none">
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
      className="bg-card border border-card-border rounded-2xl px-[22px] py-5 shadow-sm"
    >
      {/* Header: avatar + name + status */}
      <div className="flex items-start gap-3.5 mb-4">
        <Link to={`/profile/${req.requester._id}`} className="shrink-0">
          <Avatar name={req.requester.name} src={req.requester.avatarUrl} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link to={`/profile/${req.requester._id}`} className="no-underline">
              <span className="text-[15px] font-bold text-text-primary">{req.requester.name}</span>
            </Link>
            <span className="text-[13px] text-text-muted">@{req.requester.username}</span>
            <span className="px-2.5 py-[3px] rounded-full text-xs font-semibold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {s.label}
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-2.5 flex-wrap">
            {req.portfolioUrl && (
              <a href={req.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs no-underline font-medium" style={{ color: COLLAB_COLOR }}>
                <Globe size={12} /> Portfolio
              </a>
            )}
            {req.resumeUrl && (
              <a href={req.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs no-underline font-medium" style={{ color: COLLAB_COLOR }}>
                <FileText size={12} /> Resume / CV
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        {status === 'pending' && (
          <div className="flex gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.96 }} onClick={() => respond('accepted')} disabled={!!acting}
              className={`flex items-center justify-center gap-[5px] min-h-11 px-4 rounded-[9px] border-none bg-(image:--btn-grad) text-white text-[13px] font-semibold shadow-btn transition-[transform,opacity] duration-200 hover:opacity-90 hover:-translate-y-px ${acting ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {acting === 'accepted' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Accept
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }} onClick={() => respond('rejected')} disabled={!!acting}
              className={`flex items-center justify-center gap-[5px] min-h-11 px-3.5 rounded-[9px] border-[1.5px] border-border bg-card text-text-secondary text-[13px] font-medium transition-[transform,opacity] duration-200 hover:opacity-90 hover:-translate-y-px ${acting ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {acting === 'rejected' ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
              Reject
            </motion.button>
          </div>
        )}
        {status === 'accepted' && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)]">
            <Check size={14} color="#16a34a" />
            <span className="text-[13px] font-semibold text-[#16a34a]">Accepted</span>
          </div>
        )}
        {status === 'rejected' && (
          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
              <X size={13} color="#dc2626" />
              <span className="text-xs font-semibold text-[#dc2626]">Rejected</span>
            </div>
            <button
              onClick={() => respond('accepted')}
              className="text-[13px] min-h-8 text-text-muted bg-none border-none cursor-pointer underline hover:text-text-primary focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              Undo
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-divider mb-3.5" />

      {/* Why */}
      <div className={req.expertise ? 'mb-3' : 'mb-0'}>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
          Why they want to join
        </p>
        <p className="text-sm text-text-secondary leading-[1.65]">
          "{req.why}"
        </p>
      </div>

      {/* Expertise */}
      {req.expertise && (
        <div className="mt-3 px-3.5 py-3 rounded-[10px] bg-surface-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
            Experience & expertise
          </p>
          <p className="text-[13px] text-text-secondary leading-[1.6]">
            {req.expertise}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function CollabRequestsPage() {
  const { postId } = useParams();
  const [tab, setTab] = useState('all');

  const { data: post } = usePost(postId);
  const {
    data: requests = [],
    isLoading: loading,
    error: queryError,
  } = useCollabRequesters(postId, true, true);
  const error = queryError ? (queryError.response?.data?.message ?? 'Failed to load requests.') : '';

  const load = () => {
    queryClient.invalidateQueries({ queryKey: ['collab-requesters', postId, true] });
  };

  const filtered = tab === 'all' ? requests : requests.filter((r) => r.status === tab);

  const counts = {
    all:      requests.length,
    pending:  requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-svh bg-surface-0">
      <Navbar />

      <div className="max-w-[760px] mx-auto px-4 pt-6 pb-12">

        {/* Back */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-[13px] text-text-muted no-underline mb-5 min-h-11 px-1 rounded-lg transition-colors duration-150 hover:text-text-primary hover:bg-surface-2"
        >
          <ArrowLeft size={14} /> Back to Explore
        </Link>

        {/* Page header */}
        <div
          className="bg-card rounded-2xl px-[22px] py-5 mb-5"
          style={{ border: `1px solid ${COLLAB_COLOR}35`, boxShadow: `0 2px 12px ${COLLAB_COLOR}12` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={18} color={COLLAB_COLOR} />
            <h1 className="text-lg font-extrabold text-text-primary tracking-[-0.3px]">
              Applications
            </h1>
          </div>
          {post && (
            <p className="text-sm text-text-muted">
              for <span className="font-semibold" style={{ color: COLLAB_COLOR }}>{post.projectName || post.title}</span>
            </p>
          )}

          {/* Stats row */}
          <div className="flex gap-4 mt-3.5 flex-wrap">
            {[
              { label: 'Total',    val: counts.all,      color: COLLAB_COLOR      },
              { label: 'Pending',  val: counts.pending,  color: '#d97706'         },
              { label: 'Accepted', val: counts.accepted, color: '#16a34a'         },
              { label: 'Rejected', val: counts.rejected, color: 'var(--text-muted)' },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center min-w-[52px]">
                <p className="text-[22px] font-extrabold m-0" style={{ color }}>{val}</p>
                <p className="text-[11px] text-text-muted m-0">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-card border border-border rounded-xl p-1 overflow-hidden">
          {TABS.map((t) => (
            <button
              key={t} onClick={() => setTab(t)}
              className={[
                'flex-1 min-h-11 p-2 rounded-[9px] border-none cursor-pointer capitalize',
                'flex items-center justify-center gap-[5px] transition-colors duration-150',
                tab === t ? 'text-white font-bold' : 'bg-transparent text-text-secondary font-medium',
              ].join(' ')}
              style={{ background: tab === t ? COLLAB_COLOR : 'transparent' }}
            >
              {t}
              {counts[t] > 0 && (
                <span
                  className="px-1.5 py-px rounded-[10px] text-[11px] font-bold"
                  style={{ background: tab === t ? 'rgba(255,255,255,0.25)' : 'var(--surface-2)', color: tab === t ? '#fff' : 'var(--text-muted)' }}
                >
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center p-15 text-text-muted">
            <Loader2 size={28} color={COLLAB_COLOR} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center p-15 text-error text-sm">
            <AlertTriangle size={32} className="mb-2 mx-auto" />
            <p className="m-0 text-sm leading-relaxed">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-15 text-text-muted">
            <Users2 size={40} color="var(--text-faint)" className="mb-3 mx-auto" />
            <p className="text-[15px] font-semibold text-text-primary mb-1.5">
              {tab === 'all' ? 'No applications yet' : `No ${tab} applications`}
            </p>
            <p className="text-[13px]">
              {tab === 'all' ? 'Share your collab post to attract collaborators.' : `Switch tabs to see other applications.`}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {filtered.map((req) => (
                <ApplicantCard key={req._id} req={req} onUpdate={load} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
