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
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, background: undefined }} className="rounded-full object-cover shrink-0" />;
  return (
    <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-semibold shrink-0">
      {initials}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card border border-card-border rounded-xl px-4 py-3.5 transition-colors duration-250">
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-muted mb-2.5">
        {title}
      </p>
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="flex justify-center p-3"><Loader2 size={16} color="var(--text-muted)" className="animate-spin" /></div>;
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
    <aside className="hidden xl:flex sticky top-[112px] h-[calc(100svh-112px)] overflow-y-auto w-70 shrink-0 flex-col gap-3.5 pb-6 scrollbar-none">
      {/* Quick share */}
      <Section title="✏️ Quick share">
        {!composing ? (
          <button
            onClick={() => setComposing(true)}
            className="w-full text-left px-3 py-2 rounded-full border-[1.5px] border-border hover:border-accent-border bg-input text-text-muted text-[13px] cursor-text transition-colors duration-150"
          >
            {user ? `What's on your mind?` : 'Log in to post…'}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              autoFocus
              rows={3}
              value={postBody}
              onChange={(e) => setPostBody(e.target.value)}
              placeholder="Write your post…"
              className="w-full px-2.5 py-2 rounded-lg border-[1.5px] border-accent-border text-[13px] leading-normal resize-none outline-none font-[inherit] text-text-primary bg-input"
            />
            <div className="flex justify-end gap-1.5">
              <button onClick={() => setComposing(false)} className="px-2.5 py-[5px] rounded-[7px] border-[1.5px] border-border bg-transparent text-xs cursor-pointer text-text-secondary">Cancel</button>
              <button
                onClick={handlePost}
                disabled={!postBody.trim() || posted}
                className={[
                  'px-3 py-[5px] rounded-[7px] border-none text-xs font-semibold transition-colors duration-200',
                  posted ? 'bg-success-bg text-success' : postBody.trim() ? 'bg-accent text-white cursor-pointer' : 'bg-accent-dim text-white cursor-not-allowed',
                ].join(' ')}
              >
                {posted ? 'Posted! ✓' : 'Post'}
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Trending */}
      <Section title="🔥 Trending">
        {tagsLoading ? <Spinner /> : !tags?.length ? (
          <p className="text-[13px] text-text-muted">No data yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {tags.map((tag) => (
              <div key={tag.label} className="flex justify-between items-center px-1.5 py-1 rounded-[7px] cursor-pointer transition-colors duration-100 hover:bg-hover">
                <span className="text-[13px] font-medium text-accent">{tag.label}</span>
                <span className="text-[11px] text-text-muted">{tag.count} posts</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Top this week */}
      <Section title="⭐ Top This Week">
        {topLoading ? <Spinner /> : !topPosts?.length ? (
          <p className="text-[13px] text-text-muted">No posts yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {topPosts.map((post, i) => (
              <div key={post._id}>
                {i > 0 && <div className="h-px bg-divider mb-2.5" />}
                <div className="group cursor-pointer">
                  <p className="text-[13px] font-semibold text-text-primary leading-[1.35] mb-1 transition-colors duration-[120ms] group-hover:text-accent">{post.title}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
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
          <p className="text-[13px] text-text-muted">No suggestions yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map((u) => {
              const isFollowing = Array.isArray(user?.following) && user.following.includes(u._id);
              return (
                <div key={u._id} className="flex items-center gap-2.5">
                  <Link to={`/profile/${u._id}`} className="flex items-center gap-2.5 flex-1 min-w-0 no-underline">
                    <Avatar name={u.name} src={u.avatarUrl || null} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary m-0">{u.name}</p>
                      <p className="text-[11px] text-text-muted m-0 overflow-hidden text-ellipsis whitespace-nowrap">{u.bio || `@${u.username}`}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleFollow(u._id)}
                    className={[
                      'px-2.5 py-1 rounded-full shrink-0 text-[11px] font-semibold cursor-pointer flex items-center gap-[3px] transition-all duration-150 border-[1.5px]',
                      isFollowing ? 'border-border bg-surface-2 text-text-secondary' : 'border-accent bg-accent text-white',
                    ].join(' ')}
                  >
                    {isFollowing ? <><Check size={10} /> Following</> : <><UserPlus size={10} /> Follow</>}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Footer */}
      <div className="px-1">
        <p className="text-[11px] text-text-muted leading-[1.9]">
          {['About', 'Guidelines', 'Privacy', 'Terms'].map((l, i) => (
            <span key={l}>{i > 0 && ' · '}<a href="#" className="text-text-muted" onClick={(e) => e.preventDefault()}>{l}</a></span>
          ))}
        </p>
        <p className="text-[11px] text-text-faint mt-0.5">© 2026 Prograstic</p>
      </div>
    </aside>
  );
}
