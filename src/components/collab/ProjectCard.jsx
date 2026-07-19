import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users2, Clock, ClipboardList, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import JoinProjectModal from '../feed/JoinProjectModal';



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
  const filled      = post.membersNeeded > 0 && (post.memberCount ?? 0) >= post.membersNeeded;
  const unlimited   = post.membersNeeded === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 100, damping: 20 }}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        className="group relative bg-card/90 backdrop-blur-sm rounded-[24px] p-5 flex flex-col gap-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-border/40 cursor-pointer overflow-hidden"
        onClick={() => navigate(`/project/${post._id}`)}
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -z-10 bg-accent/5 group-hover:bg-accent/10 transition-colors duration-300" />

        {/* Top: domain badge + time */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold border bg-accent/10 text-accent border-accent/20">
            {post.domain}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-text-muted">
            <Clock size={11} /> {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Title + project name */}
        <div className="mt-1">
          {post.projectName && (
            <p className="text-[13px] font-bold mb-1.5 flex items-center gap-1.5 text-accent">
              <span className="w-5 h-5 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20">🚀</span>
              {post.projectName}
            </p>
          )}
          <h3 className="text-[16px] font-bold text-text-primary leading-snug tracking-tight group-hover:text-accent transition-colors">
            {post.title}
          </h3>
          {post.body && (
            <p className="text-[13px] text-text-secondary leading-relaxed mt-2.5 line-clamp-2">
              {post.body}
            </p>
          )}
        </div>

        {/* Tech stack */}
        {post.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {post.techStack.map(t => (
              <span key={t} className="px-2.5 py-[3px] rounded-md bg-surface-1 border border-border/40 text-text-secondary text-[11px] font-medium font-mono">{t}</span>
            ))}
          </div>
        )}

        {/* Roles needed */}
        {post.rolesNeeded?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {post.rolesNeeded.map(r => (
              <span key={r} className="px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-2 text-text-secondary border border-border/60">{r}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border/40">
          {/* Author */}
          <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-1.5 no-underline shrink-0 group/avatar z-10" onClick={(e) => e.stopPropagation()}>
            <Avatar name={post.author?.name} src={post.author?.avatarUrl} size={24} />
            <span className="text-[12px] text-text-muted font-medium group-hover/avatar:text-text-primary transition-colors">{post.author?.name}</span>
          </Link>

          <div className="flex-1" />

          {/* Member progress */}
          <div className="flex items-center gap-1 text-[11px] font-semibold shrink-0 whitespace-nowrap" style={{ color: filled ? '#10b981' : 'var(--text-muted)' }}>
            <Users2 size={13} className={filled ? 'text-green-500' : 'text-text-muted'} />
            <span className={filled ? 'text-green-500' : 'text-text-primary'}>
              {unlimited ? `${post.memberCount ?? 0} joined` : `${post.memberCount ?? 0}/${post.membersNeeded}`}
            </span>
            {filled && <span className="text-green-500 ml-0.5">• Full</span>}
          </div>

          {/* Action button */}
          <div className="z-10 shrink-0 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            {isOwn ? (
              showReviewLink && (post.requestCount ?? 0) > 0 ? (
                <Link to={`/collab/${post._id}/requests`} className="no-underline block">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-accent text-white shadow-sm shadow-accent/20"
                  >
                    <ClipboardList size={14} /> Review ({post.requestCount})
                  </motion.div>
                </Link>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-accent bg-accent/10 border border-accent/20">Your project</span>
              )
            ) : requested ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-1.5 rounded-lg">
                <CheckCircle size={13} /> Requested
              </span>
            ) : !filled ? (
              <motion.button 
                onClick={() => setJoinOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-1.5 rounded-xl bg-text-primary text-card hover:bg-accent hover:text-white transition-colors shadow-sm"
              >
                Join <ArrowRight size={14} />
              </motion.button>
            ) : (
              <span className="text-[11px] font-medium text-text-muted bg-surface-2 px-2.5 py-1.5 rounded-lg">Team full</span>
            )}
          </div>
        </div>
      </motion.div>

      {joinOpen && (
        <JoinProjectModal post={post} onClose={(success) => { setJoinOpen(false); if (success) setRequested(true); }} />
      )}
    </>
  );
}
