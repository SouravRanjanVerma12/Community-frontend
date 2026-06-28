import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, X, Loader2, ExternalLink, ClipboardList, Users2, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { queryClient } from '../../api/queryClient';
import Button from '../ui/Button';
import { useCollabRequesters } from '../../hooks/useCollabRequests';

const COLLAB_COLOR = '#3a3d4a';

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0 border-2 border-card" />;
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold shrink-0 border-2 border-card select-none">
      {initials}
    </div>
  );
}

const STATUS_STYLES = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#d97706', label: 'Pending'   },
  accepted: { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', label: 'Accepted'  },
  rejected: { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626', label: 'Rejected'  },
};

/* Creator row — full details + accept/reject */
function CreatorRow({ req, onRespond }) {
  const [acting, setActing] = useState(false);
  const [status, setStatus] = useState(req.status);
  const s = STATUS_STYLES[status];

  const respond = async (newStatus) => {
    setActing(true);
    try {
      await api.patch(`/collab-requests/${req._id}`, { status: newStatus });
      setStatus(newStatus);
    } finally {
      setActing(false);
      onRespond?.();
    }
  };

  return (
    <div className="py-3 border-b border-divider">
      <div className="flex items-start gap-2.5">
        <Link to={`/profile/${req.requester._id}`} className="shrink-0">
          <Avatar name={req.requester.name} src={req.requester.avatarUrl} size={36} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link to={`/profile/${req.requester._id}`} className="no-underline">
              <span className="text-[13px] font-bold text-text-primary">{req.requester.name}</span>
            </Link>
            <span className="text-[11px] text-text-muted">@{req.requester.username}</span>
            <span className="px-2 py-0.5 rounded-[10px] text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
            {req.portfolioUrl && (
              <a href={req.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[11px] no-underline" style={{ color: COLLAB_COLOR }}>
                <ExternalLink size={10} /> Portfolio
              </a>
            )}
            {req.resumeUrl && (
              <a href={req.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[11px] no-underline" style={{ color: COLLAB_COLOR }}>
                <ExternalLink size={10} /> Resume
              </a>
            )}
          </div>

          {/* Why */}
          <p className={`text-[13px] text-text-secondary leading-[1.55] ${req.expertise ? 'mb-1.5' : 'mb-0'}`}>
            "{req.why}"
          </p>

          {/* Expertise */}
          {req.expertise && (
            <p className="text-xs text-text-muted leading-normal italic">
              {req.expertise}
            </p>
          )}
        </div>

        {/* Accept / Reject */}
        {status === 'pending' && (
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" onClick={() => respond('accepted')} disabled={acting} style={{ padding: '5px 12px', minHeight: '36px', fontSize: '12px' }}>
              {acting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Accept
            </Button>
            <Button variant="ghost" size="sm" onClick={() => respond('rejected')} disabled={acting} style={{ padding: '5px 10px', minHeight: '36px', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>
              <X size={12} /> Reject
            </Button>
          </div>
        )}
        {status !== 'pending' && (
          <span className="shrink-0 flex items-center">
            {status === 'accepted'
              ? <CheckCircle2 size={20} color="#16a34a" />
              : <XCircle size={20} color="#dc2626" />}
          </span>
        )}
      </div>
    </div>
  );
}

/* Public row — avatar + name only */
function PublicRow({ person }) {
  return (
    <div className="flex items-center gap-[9px] py-2 border-b border-divider">
      <Link to={`/profile/${person._id}`}>
        <Avatar name={person.name} src={person.avatarUrl} size={30} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${person._id}`} className="no-underline">
          <span className="text-[13px] font-semibold text-text-primary">{person.name}</span>
        </Link>
        <span className="text-xs text-text-muted ml-1.5">@{person.username}</span>
      </div>
      {person.status === 'accepted' && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16a34a] bg-[rgba(34,197,94,0.1)] px-2 py-0.5 rounded-[10px]">
          <Check size={11} /> Joined
        </span>
      )}
    </div>
  );
}

export default function CollabRequesters({ postId, requestCount, isCreator }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading: loading } = useCollabRequesters(postId, isCreator, open);

  const toggle = () => setOpen((v) => !v);

  const refetchAfterRespond = () => {
    queryClient.invalidateQueries({ queryKey: ['collab-requesters', postId, isCreator] });
  };

  if (!requestCount) return null;

  return (
    <div className="mt-2">
      {/* Toggle button */}
      <button
        onClick={toggle}
        className={[
          'flex items-center gap-2 w-full min-h-11 px-3.5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer',
          'transition-[background-color,transform] duration-150 justify-between',
          'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
          open ? '' : 'hover:bg-[#3a3d4a12]',
        ].join(' ')}
        style={{ border: `1px solid ${COLLAB_COLOR}25`, background: open ? `${COLLAB_COLOR}0a` : 'transparent', color: COLLAB_COLOR }}
      >
        <span className="flex items-center gap-1.5">
          {isCreator
            ? <ClipboardList size={14} />
            : <Users2 size={14} />}
          {isCreator ? `Review ${requestCount} application${requestCount !== 1 ? 's' : ''}` : `See who's interested (${requestCount})`}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* List */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 size={18} color={COLLAB_COLOR} className="animate-spin" />
                </div>
              ) : !data?.length ? (
                <div className="flex flex-col items-center gap-1.5 py-5 text-text-muted text-center">
                  <Users2 size={22} color="var(--text-faint)" />
                  <p className="text-[13px] leading-[1.6]">No requests yet.</p>
                </div>
              ) : isCreator ? (
                data.map((req) => <CreatorRow key={req._id} req={req} onRespond={refetchAfterRespond} />)
              ) : (
                data.map((person) => <PublicRow key={person._id} person={person} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
