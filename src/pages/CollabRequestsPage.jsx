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

const COLLAB_COLOR = 'var(--accent, #1e9df1)';

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
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-accent/40 transition-all"
    >
      {/* Header: avatar + name + status badge + links */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Link to={`/profile/${req.requester._id}`} className="shrink-0">
            <Avatar name={req.requester.name} src={req.requester.avatarUrl} size={46} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link to={`/profile/${req.requester._id}`} className="no-underline">
                <span className="text-[15px] font-bold text-text-primary hover:text-accent transition-colors">
                  {req.requester.name}
                </span>
              </Link>
              <span className="text-[13px] text-text-muted">@{req.requester.username}</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
              >
                {s.label}
              </span>
            </div>

            {/* Links */}
            <div className="flex gap-2 flex-wrap mt-1.5">
              {req.portfolioUrl && (
                <a
                  href={req.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary no-underline font-medium transition-colors border border-border/50"
                >
                  <Globe size={12} className="text-accent" /> Portfolio
                </a>
              )}
              {req.resumeUrl && (
                <a
                  href={req.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-secondary no-underline font-medium transition-colors border border-border/50"
                >
                  <FileText size={12} className="text-accent" /> Resume / CV
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {status === 'pending' && (
          <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => respond('accepted')}
              disabled={!!acting}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[38px] px-4 rounded-xl border-none bg-(image:--btn-grad) text-white text-[13px] font-bold shadow-btn transition-all duration-200 ${
                acting ? 'cursor-default opacity-60' : 'cursor-pointer'
              }`}
            >
              {acting === 'accepted' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Accept
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => respond('rejected')}
              disabled={!!acting}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-[38px] px-3.5 rounded-xl border border-border/80 bg-surface-2 hover:bg-surface-3 text-text-secondary text-[13px] font-medium transition-all duration-200 ${
                acting ? 'cursor-default opacity-60' : 'cursor-pointer'
              }`}
            >
              {acting === 'rejected' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Decline
            </motion.button>
          </div>
        )}
        {status === 'rejected' && (
          <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0">
            <button
              onClick={() => respond('accepted')}
              className="text-xs font-semibold text-text-muted bg-none border-none cursor-pointer underline hover:text-text-primary"
            >
              Undo Decline
            </button>
          </div>
        )}
      </div>

      {/* Why they want to join */}
      <div className="mb-3">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Why they want to join
        </p>
        <p className="text-xs sm:text-sm text-text-primary leading-relaxed bg-surface-2/50 p-3.5 rounded-xl border border-border/40">
          "{req.why}"
        </p>
      </div>

      {/* Experience & expertise */}
      {req.expertise && (
        <div className="mt-2.5 px-3.5 py-3 rounded-xl bg-surface-2/50 border border-border/40">
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Experience & expertise
          </p>
          <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted no-underline mb-4 px-2 py-1.5 rounded-lg transition-colors hover:text-text-primary hover:bg-surface-2"
        >
          <ArrowLeft size={14} /> Back to Explore
        </Link>

        {/* Header Card */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-accent-bg text-accent">
                <ClipboardList size={18} />
              </span>
              <div>
                <h1 className="text-lg font-extrabold text-text-primary tracking-tight m-0">
                  Applications
                </h1>
                {post && (
                  <p className="text-xs text-text-muted m-0 mt-0.5">
                    for <span className="font-semibold text-text-primary">{post.projectName || post.title}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compact Stat Pills */}
          <div className="flex items-center gap-2 pt-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-border/60 text-xs font-semibold text-text-secondary whitespace-nowrap">
              <span>Total</span>
              <span className="px-2 py-0.5 rounded-full bg-accent-bg text-accent font-bold">{counts.all}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
              <span>Pending</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 font-bold">{counts.pending}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              <span>Accepted</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 font-bold">{counts.accepted}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap">
              <span>Declined</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 font-bold">{counts.rejected}</span>
            </div>
          </div>
        </div>

        {/* iOS-Style Segmented Control Bar */}
        <div className="flex p-1 bg-surface-2/80 backdrop-blur-md rounded-2xl border border-border/70 mb-5 overflow-x-auto scrollbar-none">
          {TABS.map((t) => {
            const isActive = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl text-xs capitalize transition-all duration-200 flex items-center justify-center gap-1.5 border-none cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-card text-text-primary shadow-sm border border-border/80 font-bold'
                    : 'bg-transparent text-text-muted hover:text-text-primary font-medium'
                }`}
              >
                <span>{t}</span>
                {counts[t] > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-accent-bg text-accent' : 'bg-surface-3 text-text-muted'
                  }`}>
                    {counts[t]}
                  </span>
                )}
              </button>
            );
          })}
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
