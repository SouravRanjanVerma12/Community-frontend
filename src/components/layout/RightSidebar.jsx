import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTrendingTags, useTopPosts } from '../../hooks/usePosts';
import { useSuggestions } from '../../hooks/useProfile';
import api from '../../api/axiosInstance';

function Avatar({ name, src, size = 32 }) {
  const initials = name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const hue = [...(name ?? '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '600', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px 16px', transition: 'background 0.25s, border-color 0.25s' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '10px' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}><Loader2 size={16} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} /></div>;
}

export default function RightSidebar() {
  const { user, updateFollowing } = useAuthStore();
  const [composing, setComposing] = useState(false);
  const [postBody, setPostBody] = useState('');
  const [posted, setPosted] = useState(false);

  const { data: tags, isLoading: tagsLoading }         = useTrendingTags();
  const { data: topPosts, isLoading: topLoading }       = useTopPosts();
  const { data: suggestions, isLoading: suggestLoading } = useSuggestions();

  const toggleFollow = async (id) => {
    if (!user) return;
    try {
      const { data } = await api.post(`/users/${id}/follow`);
      updateFollowing(data.following);
    } catch { /* ignore */ }
  };

  const handlePost = () => {
    setPosted(true);
    setTimeout(() => { setPosted(false); setComposing(false); setPostBody(''); }, 1200);
  };

  return (
    <aside style={{
      position: 'sticky', top: '112px',
      height: 'calc(100svh - 112px)', overflowY: 'auto',
      width: '280px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '14px',
      paddingBottom: '24px', scrollbarWidth: 'none',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Quick share */}
      <Section title="✏️ Quick share">
        {!composing ? (
          <button onClick={() => setComposing(true)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: '20px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-muted)', fontSize: '13px', cursor: 'text', transition: 'border-color 0.15s' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
            {user ? `What's on your mind?` : 'Log in to post…'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea autoFocus rows={3} value={postBody} onChange={(e) => setPostBody(e.target.value)} placeholder="Write your post…"
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid var(--accent-border)', fontSize: '13px', lineHeight: '1.5', resize: 'none', outline: 'none', fontFamily: 'inherit', color: 'var(--text-primary)', background: 'var(--input-bg)' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button onClick={() => setComposing(false)} style={{ padding: '5px 10px', borderRadius: '7px', border: '1.5px solid var(--border)', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }}>Cancel</button>
              <button onClick={handlePost} disabled={!postBody.trim() || posted}
                style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', background: posted ? '#dcfce7' : postBody.trim() ? 'var(--accent)' : 'var(--accent-dim)', color: posted ? '#16a34a' : '#fff', fontSize: '12px', fontWeight: '600', cursor: postBody.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}>
                {posted ? 'Posted! ✓' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Trending */}
      <Section title="🔥 Trending">
        {tagsLoading ? <Spinner /> : !tags?.length ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {tags.map((tag) => (
              <div key={tag.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 6px', borderRadius: '7px', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hover-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--accent)' }}>{tag.label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tag.count} posts</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Top this week */}
      <Section title="⭐ Top This Week">
        {topLoading ? <Spinner /> : !topPosts?.length ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topPosts.map((post, i) => (
              <div key={post._id}>
                {i > 0 && <div style={{ height: '1px', background: 'var(--divider)', marginBottom: '10px' }} />}
                <div style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.querySelector('p').style.color = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.querySelector('p').style.color = 'var(--text-primary)'}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.35', marginBottom: '4px', transition: 'color 0.12s' }}>{post.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{post.author?.name}</span><span>·</span><span>❤️ {post.likeCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Who to follow */}
      <Section title="👥 Who to Follow">
        {suggestLoading ? <Spinner /> : !suggestions?.length ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No suggestions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestions.map((u) => {
              const isFollowing = Array.isArray(user?.following) && user.following.includes(u._id);
              return (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <Link to={`/profile/${u._id}`} style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0, textDecoration: 'none' }}>
                    <Avatar name={u.name} src={u.avatarUrl || null} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{u.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio || `@${u.username}`}</p>
                    </div>
                  </Link>
                  <button onClick={() => toggleFollow(u._id)} style={{ padding: '4px 10px', borderRadius: '20px', flexShrink: 0, border: isFollowing ? '1.5px solid var(--border)' : '1.5px solid var(--accent)', background: isFollowing ? 'var(--surface-2)' : 'var(--accent)', color: isFollowing ? 'var(--text-secondary)' : '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.15s' }}>
                    {isFollowing ? <><Check size={10} /> Following</> : <><UserPlus size={10} /> Follow</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Footer */}
      <div style={{ padding: '0 4px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.9' }}>
          {['About', 'Guidelines', 'Privacy', 'Terms'].map((l, i) => (
            <span key={l}>{i > 0 && ' · '}<a href="#" style={{ color: 'var(--text-muted)' }} onClick={(e) => e.preventDefault()}>{l}</a></span>
          ))}
        </p>
        <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '2px' }}>© 2026 Prograstic</p>
      </div>
    </aside>
  );
}
