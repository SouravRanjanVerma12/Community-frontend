import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ClipboardList, CheckCircle, Handshake } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import JoinProjectModal from '../feed/JoinProjectModal';

function Avatar({ name, src, size = 28 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover ring-2 ring-border" />;
  return <div style={{ width: size, height: size, background: `hsl(${hue},55%,50%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold ring-2 ring-border">{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

/* Domain badge styles — use semi-transparent colors that work in both themes */
const DOMAIN_COLORS = {
  webdev:  { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.28)',  text: '#6366f1' },
  backend: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)',  text: '#10b981' },
  aiml:    { bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.28)',  text: '#ec4899' },
  devops:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)',  text: '#f59e0b' },
  mobile:  { bg: 'rgba(14,165,233,0.12)',  border: 'rgba(14,165,233,0.28)',  text: '#0ea5e9' },
  oss:     { bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.28)',  text: '#a855f7' },
  default: { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.28)',  text: '#6366f1' },
};

export default function ProjectCard({ post, index = 0, showReviewLink = false }) {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();
  const [joinOpen,  setJoinOpen]  = useState(false);
  const [requested, setRequested] = useState(false);

  const isOwn     = user?._id === post.author?._id;
  const filled    = post.membersNeeded > 0 && (post.memberCount ?? 0) >= post.membersNeeded;
  const unlimited = post.membersNeeded === 0;
  const dc        = DOMAIN_COLORS[post.domain] ?? DOMAIN_COLORS.default;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.35, type: 'spring', stiffness: 120, damping: 22 }}
        whileHover="hover"
        whileTap={{ scale: 0.985 }}
        onClick={() => navigate(`/project/${post._id}`)}
        className="group relative flex flex-col gap-0 cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 bg-card border border-border"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {/* Hover indigo glow border */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          variants={{ hover: { boxShadow: '0 0 0 1.5px rgba(99,102,241,0.45), 0 8px 28px rgba(99,102,241,0.08)' } }}
          style={{ boxShadow: '0 0 0 0px transparent' }}
          transition={{ duration: 0.18 }}
        />

        {/* Body */}
        <div className="flex flex-col gap-3 p-5 flex-1">
          {/* Domain + time */}
          <div className="flex items-center justify-between">
            <span
              className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold"
              style={{ background: dc.bg, border: `1px solid ${dc.border}`, color: dc.text }}
            >
              {post.domain ?? 'general'}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Clock size={10} />
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Collab name */}
          {post.projectName && (
            <div className="flex flex-col gap-[2px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted m-0">Looking to collab on</p>
              <p className="text-[13px] font-bold m-0 text-indigo-500 dark:text-indigo-400">{post.projectName}</p>
            </div>
          )}

          {/* Title */}
          <h3 className="text-[15px] font-bold text-text-primary leading-snug tracking-tight m-0 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors duration-150">
            {post.title}
          </h3>

          {/* Body preview */}
          {post.body && (
            <p className="text-[13px] leading-relaxed text-text-secondary line-clamp-2 m-0">
              {post.body}
            </p>
          )}

          {/* Tech stack */}
          {post.techStack?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {post.techStack.map(t => (
                <span
                  key={t}
                  className="px-2 py-[2px] rounded-md text-[11px] font-medium font-mono bg-surface-2 border border-border text-text-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Roles needed */}
          {post.rolesNeeded?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.rolesNeeded.map(r => (
                <span
                  key={r}
                  className="px-2.5 py-[3px] rounded-full text-[11px] font-medium bg-surface-2 border border-border text-text-muted"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-border">
          {/* Author */}
          <Link
            to={`/profile/${post.author?._id}`}
            className="flex items-center gap-1.5 no-underline shrink-0 z-10"
            onClick={e => e.stopPropagation()}
          >
            <Avatar name={post.author?.name} src={post.author?.avatarUrl} size={24} />
            <span className="text-[12px] font-medium text-text-muted hover:text-text-primary transition-colors">{post.author?.name}</span>
          </Link>

          <div className="flex-1" />

          {/* Member count */}
          <span
            className="flex items-center gap-1 text-[11px] font-semibold shrink-0 whitespace-nowrap"
            style={{ color: filled ? '#10b981' : 'var(--text-muted)' }}
          >
            <Handshake size={12} />
            {unlimited ? `${post.memberCount ?? 0} joined` : `${post.memberCount ?? 0}/${post.membersNeeded}`}
            {filled && <span className="text-emerald-500 ml-0.5">· Full</span>}
          </span>

          {/* Action */}
          <div className="z-10 shrink-0 whitespace-nowrap" onClick={e => e.stopPropagation()}>
            {isOwn ? (
              showReviewLink && (post.requestCount ?? 0) > 0 ? (
                <Link to={`/collab/${post._id}/requests`} className="no-underline block">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white cursor-pointer"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 3px 10px rgba(99,102,241,0.3)' }}
                  >
                    <ClipboardList size={13} /> Review ({post.requestCount})
                  </motion.span>
                </Link>
              ) : (
                <span
                  className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                  style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
                >
                  Your collab
                </span>
              )
            ) : requested ? (
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg"
                style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <CheckCircle size={12} /> Applied
              </span>
            ) : !filled ? (
              <motion.button
                onClick={() => setJoinOpen(true)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-lg text-white border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 3px 10px rgba(99,102,241,0.25)' }}
              >
                Apply
              </motion.button>
            ) : (
              <span className="text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-text-muted">
                Team full
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {joinOpen && (
        <JoinProjectModal post={post} onClose={success => { setJoinOpen(false); if (success) setRequested(true); }} />
      )}
    </>
  );
}
