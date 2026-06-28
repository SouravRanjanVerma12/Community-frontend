import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users2, Clock, ClipboardList, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import JoinProjectModal from '../feed/JoinProjectModal';
import Button from '../ui/Button';

const CC = '#3a3d4a';
const DOMAIN_COLORS = {
  webdev: '#2563eb', backend: '#059669', devops: '#d97706',
  aiml: '#7c3aed', mobile: '#db2777', oss: '#0891b2',
};

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover border-2 border-card" />;
  return <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold border-2 border-card">{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function ProjectCard({ post, index = 0, showReviewLink = false }) {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const [joinOpen,   setJoinOpen]   = useState(false);
  const [requested,  setRequested]  = useState(false);

  const isOwn       = user?._id === post.author?._id;
  const domainColor = DOMAIN_COLORS[post.domain] ?? CC;
  const filled      = post.membersNeeded > 0 && (post.memberCount ?? 0) >= post.membersNeeded;
  const unlimited   = post.membersNeeded === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -3, boxShadow: `0 8px 32px ${CC}18, 0 2px 8px rgba(0,0,0,0.08)` }}
        className="bg-card rounded-2xl p-5 flex flex-col gap-3.5 shadow-sm transition-[box-shadow,transform] duration-200 cursor-default"
        style={{ border: `1px solid ${CC}28` }}
      >
        {/* Top: domain badge + time */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold" style={{ background: `${domainColor}14`, color: domainColor }}>
            {post.domain}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-text-muted">
            <Clock size={11} /> {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Title + project name */}
        <div>
          {post.projectName && (
            <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: CC }}>
              🚀 {post.projectName}
            </p>
          )}
          <h3 className="text-[15px] font-bold text-text-primary leading-[1.4] tracking-[-0.2px]">
            {post.title}
          </h3>
          {post.body && (
            <p className="text-[13px] text-text-secondary leading-[1.6] mt-1.5 line-clamp-2">
              {post.body}
            </p>
          )}
        </div>

        {/* Tech stack */}
        {post.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-[5px]">
            {post.techStack.map(t => (
              <span key={t} className="px-2.5 py-[3px] rounded-md bg-surface-2 text-text-secondary text-[11px] font-medium font-mono">{t}</span>
            ))}
          </div>
        )}

        {/* Roles needed */}
        {post.rolesNeeded?.length > 0 && (
          <div className="flex flex-wrap gap-[5px]">
            {post.rolesNeeded.map(r => (
              <span key={r} className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold" style={{ background: `${CC}14`, color: CC, border: `1px solid ${CC}25` }}>{r}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-divider" />

        {/* Footer: author + stats + action */}
        <div className="flex items-center gap-2.5">
          {/* Author */}
          <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-1.5 no-underline shrink-0">
            <Avatar name={post.author?.name} src={post.author?.avatarUrl} size={24} />
            <span className="text-xs text-text-muted font-medium">{post.author?.name}</span>
          </Link>

          <div className="flex-1" />

          {/* Member progress */}
          <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: filled ? '#16a34a' : CC }}>
            <Users2 size={12} />
            {unlimited ? `${post.memberCount ?? 0} joined` : `${post.memberCount ?? 0}/${post.membersNeeded}`}
            {filled && ' • Full'}
          </div>

          {/* Interest count */}
          {(post.requestCount ?? 0) > 0 && (
            <span className="text-[11px] font-semibold text-[#d97706]">🔥 {post.requestCount}</span>
          )}

          {/* Action button */}
          {isOwn ? (
            showReviewLink && (post.requestCount ?? 0) > 0 ? (
              <Link to={`/collab/${post._id}/requests`} className="no-underline">
                <Button size="sm" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }}>
                  <ClipboardList size={12} /> Review ({post.requestCount})
                </Button>
              </Link>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ color: CC, background: `${CC}10`, border: `1px solid ${CC}25` }}>Your project</span>
            )
          ) : requested ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-[#16a34a]">
              <CheckCircle size={13} /> Requested
            </span>
          ) : !filled ? (
            <Button size="sm" onClick={() => setJoinOpen(true)} style={{ padding: '6px 14px', fontSize: '12px', minHeight: 'auto' }}>
              <Users2 size={12} /> Join
            </Button>
          ) : (
            <span className="text-[11px] font-medium text-text-muted">Team full</span>
          )}
        </div>
      </motion.div>

      {joinOpen && (
        <JoinProjectModal post={post} onClose={() => { setJoinOpen(false); setRequested(true); }} />
      )}
    </>
  );
}
