import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, X, Loader2, ExternalLink, ClipboardList, Users2, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import Button from '../ui/Button';

const COLLAB_COLOR = '#3a3d4a';

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--card-bg)' }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', flexShrink: 0, border: '2px solid var(--card-bg)', userSelect: 'none' }}>
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
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--divider)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <Link to={`/profile/${req.requester._id}`} style={{ flexShrink: 0 }}>
          <Avatar name={req.requester.name} src={req.requester.avatarUrl} size={36} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <Link to={`/profile/${req.requester._id}`} style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{req.requester.name}</span>
            </Link>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{req.requester.username}</span>
            <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', background: s.bg, color: s.color }}>{s.label}</span>
            {req.portfolioUrl && (
              <a href={req.portfolioUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: COLLAB_COLOR, textDecoration: 'none' }}>
                <ExternalLink size={10} /> Portfolio
              </a>
            )}
            {req.resumeUrl && (
              <a href={req.resumeUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: COLLAB_COLOR, textDecoration: 'none' }}>
                <ExternalLink size={10} /> Resume
              </a>
            )}
          </div>

          {/* Why */}
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', marginBottom: req.expertise ? '6px' : '0' }}>
            "{req.why}"
          </p>

          {/* Expertise */}
          {req.expertise && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', fontStyle: 'italic' }}>
              {req.expertise}
            </p>
          )}
        </div>

        {/* Accept / Reject */}
        {status === 'pending' && (
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <Button size="sm" onClick={() => respond('accepted')} disabled={acting}
              className="collab-requesters-action"
              style={{ padding: '5px 12px', minHeight: '36px', fontSize: '12px' }}>
              {acting ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} />}
              Accept
            </Button>
            <Button variant="ghost" size="sm" onClick={() => respond('rejected')} disabled={acting}
              className="collab-requesters-action"
              style={{ padding: '5px 10px', minHeight: '36px', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)' }}>
              <X size={12} /> Reject
            </Button>
          </div>
        )}
        {status !== 'pending' && (
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 0', borderBottom: '1px solid var(--divider)' }}>
      <Link to={`/profile/${person._id}`}>
        <Avatar name={person.name} src={person.avatarUrl} size={30} />
      </Link>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Link to={`/profile/${person._id}`} style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{person.name}</span>
        </Link>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '6px' }}>@{person.username}</span>
      </div>
      {person.status === 'accepted' && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: '600', color: '#16a34a', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '10px' }}>
          <Check size={11} /> Joined
        </span>
      )}
    </div>
  );
}

export default function CollabRequesters({ postId, requestCount, isCreator }) {
  const [open, setOpen]           = useState(false);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);

  const load = async () => {
    if (data) return; // already loaded
    setLoading(true);
    try {
      const endpoint = isCreator ? `/posts/${postId}/requests` : `/posts/${postId}/requesters`;
      const { data: res } = await api.get(endpoint);
      setData(isCreator ? res.requests : res.requesters);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) load();
    setOpen((v) => !v);
  };

  if (!requestCount) return null;

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Toggle button */}
      <button onClick={toggle}
        className="collab-requesters-toggle"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
          minHeight: '44px', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${COLLAB_COLOR}25`,
          background: open ? `${COLLAB_COLOR}0a` : 'transparent',
          color: COLLAB_COLOR, fontSize: '13px', fontWeight: '600',
          cursor: 'pointer', transition: 'background 150ms ease, transform 150ms ease', justifyContent: 'space-between',
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: '4px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                  <Loader2 size={18} color={COLLAB_COLOR} style={{ animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : !data?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '20px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <Users2 size={22} color="var(--text-faint)" />
                  <p style={{ fontSize: '13px', lineHeight: 1.6 }}>No requests yet.</p>
                </div>
              ) : isCreator ? (
                data.map((req) => <CreatorRow key={req._id} req={req} onRespond={() => setData(null)} />)
              ) : (
                data.map((person) => <PublicRow key={person._id} person={person} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .collab-requesters-toggle:hover { background: ${COLLAB_COLOR}12; }
        .collab-requesters-toggle:focus-visible,
        .collab-requesters-action:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .collab-requesters-action:hover:not(:disabled) { opacity: 0.88; }
      `}</style>
    </div>
  );
}
