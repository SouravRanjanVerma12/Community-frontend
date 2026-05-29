import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { DOMAINS } from '../../data/mockPosts';

function Avatar({ name, src, size = 36 }) {
  const initials = (name ?? 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `hsl(${hue},55%,55%)`, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: '600', flexShrink: 0, userSelect: 'none',
    }}>
      {initials}
    </div>
  );
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e4e7ec', marginTop: '12px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 14px',
        background: '#f3f4f6',
        borderBottom: '1px solid #e4e7ec',
      }}>
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', fontFamily: 'var(--mono)' }}>
          {language}
        </span>
        <button
          onClick={copy}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '5px', border: 'none',
            background: copied ? '#dcfce7' : 'transparent',
            color: copied ? '#16a34a' : '#9ca3af',
            fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      {/* Code */}
      <pre style={{
        margin: 0, padding: '16px',
        background: '#1e1e2e',
        color: '#cdd6f4',
        fontSize: '13px', lineHeight: '1.65',
        fontFamily: 'var(--mono)',
        overflowX: 'auto',
        whiteSpace: 'pre',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function PostCard({ post, index = 0 }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const domain = DOMAINS.find((d) => d.value === post.domain) ?? DOMAINS[0];

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}
      style={{
        background: '#ffffff',
        border: '1px solid #e4e7ec',
        borderRadius: '14px',
        padding: '20px 22px',
        cursor: 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Link to={`/profile/${post.author._id}`} style={{ flexShrink: 0 }}>
          <Avatar name={post.author.name} src={post.author.avatarUrl || null} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/profile/${post.author._id}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0, display: 'inline' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#7c3aed')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
            >
              {post.author.name}
            </p>
          </Link>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
            @{post.author.username || post.author.email?.split('@')[0] || 'user'} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {/* Domain badge */}
        <span style={{
          padding: '3px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '500',
          background: `${domain.color}12`,
          color: domain.color,
          flexShrink: 0,
        }}>
          {domain.label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '16px', fontWeight: '700',
        color: '#111827', lineHeight: '1.4',
        marginBottom: '8px', letterSpacing: '-0.2px',
      }}>
        {post.title}
      </h3>

      {/* Body */}
      {post.body && (
        <p style={{
          fontSize: '14px', color: '#4b5563',
          lineHeight: '1.65', marginBottom: post.type === 'code' ? '0' : '14px',
        }}>
          {post.body}
        </p>
      )}

      {/* Code block */}
      {post.type === 'code' && post.codeSnippet && (
        <CodeBlock code={post.codeSnippet} language={post.language} />
      )}

      {/* Action row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: '16px', paddingTop: '14px',
        borderTop: '1px solid #f3f4f6',
      }}>
        <ActionBtn
          icon={<Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#9ca3af'} />}
          label={likeCount}
          onClick={toggleLike}
          active={liked}
          activeColor="#ef4444"
        />
        <ActionBtn
          icon={<MessageCircle size={15} color="#9ca3af" />}
          label={post.commentCount}
        />
        <div style={{ marginLeft: 'auto' }}>
          <ActionBtn icon={<Share2 size={15} color="#9ca3af" />} onClick={share} />
        </div>
      </div>
    </motion.article>
  );
}

function ActionBtn({ icon, label, onClick, active, activeColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '5px 10px', borderRadius: '8px', border: 'none',
        background: 'transparent',
        color: active ? activeColor : '#9ca3af',
        fontSize: '13px', fontWeight: '500',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.background = '#f3f4f6')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon}
      {label !== undefined && <span>{label}</span>}
    </button>
  );
}
