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
  aiml: '#7c3aed', mobile: '#db2777', oss: '#0891b2', career: '#ea580c',
};

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--card-bg)' }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', border: '2px solid var(--card-bg)' }}>{initials}</div>;
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
        style={{
          background: 'var(--card-bg)',
          border: `1px solid ${CC}28`,
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow 0.2s, transform 0.2s',
          cursor: 'default',
        }}
      >
        {/* Top: domain badge + time */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${domainColor}14`, color: domainColor }}>
            {post.domain}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Clock size={11} /> {timeAgo(post.createdAt)}
          </span>
        </div>

        {/* Title + project name */}
        <div>
          {post.projectName && (
            <p style={{ fontSize: '12px', fontWeight: '700', color: CC, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              🚀 {post.projectName}
            </p>
          )}
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4', letterSpacing: '-0.2px' }}>
            {post.title}
          </h3>
          {post.body && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {post.body}
            </p>
          )}
        </div>

        {/* Tech stack */}
        {post.techStack?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {post.techStack.map(t => (
              <span key={t} style={{ padding: '3px 9px', borderRadius: '6px', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500', fontFamily: 'var(--mono)' }}>{t}</span>
            ))}
          </div>
        )}

        {/* Roles needed */}
        {post.rolesNeeded?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {post.rolesNeeded.map(r => (
              <span key={r} style={{ padding: '3px 10px', borderRadius: '20px', background: `${CC}14`, color: CC, fontSize: '11px', fontWeight: '600', border: `1px solid ${CC}25` }}>{r}</span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--divider)' }} />

        {/* Footer: author + stats + action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Author */}
          <Link to={`/profile/${post.author?._id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', flexShrink: 0 }}>
            <Avatar name={post.author?.name} src={post.author?.avatarUrl} size={24} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{post.author?.name}</span>
          </Link>

          <div style={{ flex: 1 }} />

          {/* Member progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: filled ? '#16a34a' : CC, fontWeight: '600' }}>
            <Users2 size={12} />
            {unlimited ? `${post.memberCount ?? 0} joined` : `${post.memberCount ?? 0}/${post.membersNeeded}`}
            {filled && ' • Full'}
          </div>

          {/* Interest count */}
          {(post.requestCount ?? 0) > 0 && (
            <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>🔥 {post.requestCount}</span>
          )}

          {/* Action button */}
          {isOwn ? (
            showReviewLink && (post.requestCount ?? 0) > 0 ? (
              <Link to={`/collab/${post._id}/requests`} style={{ textDecoration: 'none' }}>
                <Button size="sm" style={{ padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }}>
                  <ClipboardList size={12} /> Review ({post.requestCount})
                </Button>
              </Link>
            ) : (
              <span style={{ fontSize: '11px', color: CC, fontWeight: '600', padding: '6px 10px', borderRadius: '8px', background: `${CC}10`, border: `1px solid ${CC}25` }}>Your project</span>
            )
          ) : requested ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
              <CheckCircle size={13} /> Requested
            </span>
          ) : !filled ? (
            <Button size="sm" onClick={() => setJoinOpen(true)} style={{ padding: '6px 14px', fontSize: '12px', minHeight: 'auto' }}>
              <Users2 size={12} /> Join
            </Button>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Team full</span>
          )}
        </div>
      </motion.div>

      {joinOpen && (
        <JoinProjectModal post={post} onClose={() => { setJoinOpen(false); setRequested(true); }} />
      )}
    </>
  );
}
