import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users2, Compass, Briefcase, LayoutDashboard, Loader2, PenSquare, Sliders, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/collab/ProjectCard';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axiosInstance';

const CC = '#0891b2';

const DOMAIN_FILTERS = [
  { value: '', label: 'All Domains' },
  { value: 'webdev',  label: 'Web Dev'      },
  { value: 'backend', label: 'Backend'      },
  { value: 'aiml',    label: 'AI / ML'      },
  { value: 'devops',  label: 'DevOps'       },
  { value: 'mobile',  label: 'Mobile'       },
  { value: 'oss',     label: 'Open Source'  },
];

const ROLE_FILTERS = [
  'Frontend Dev', 'Backend Dev', 'Designer',
  'DevOps', 'ML Engineer', 'Mobile Dev', 'Full Stack',
];

/* ── Discover tab ── */
function DiscoverTab() {
  const [search,       setSearch]       = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [roleFilter,   setRoleFilter]   = useState('');
  const [showFilters,  setShowFilters]  = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['collab-posts', domainFilter, search],
    queryFn: async () => {
      const params = { type: 'collab', limit: 30 };
      if (domainFilter) params.domain = domainFilter;
      if (search)       params.search = search;
      const { data } = await api.get('/posts', { params });
      return data.posts;
    },
  });

  const filtered = roleFilter
    ? posts.filter(p => p.rolesNeeded?.includes(roleFilter))
    : posts;

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', minHeight: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--card-bg)', transition: 'border-color 150ms ease' }}
          onFocusCapture={(e) => e.currentTarget.style.borderColor = CC}
          onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={14} color="var(--text-muted)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, tech, roles…"
            style={{ flex: 1, padding: '10px 0', background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)' }} />
        </div>
        <button onClick={() => setShowFilters(v => !v)}
          className="collab-focusable"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '0 16px', borderRadius: '10px', border: `1.5px solid ${showFilters ? CC : 'var(--border)'}`, background: showFilters ? `${CC}10` : 'var(--card-bg)', color: showFilters ? CC : 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 150ms ease, border-color 150ms ease', whiteSpace: 'nowrap' }}>
          <Sliders size={14} /> Filters {(domainFilter || roleFilter) && '•'}
        </button>
      </div>

      {/* Filter pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Domain */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Domain</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {DOMAIN_FILTERS.map(d => (
                    <button key={d.value} onClick={() => setDomainFilter(d.value)}
                      style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${domainFilter === d.value ? CC : 'var(--border)'}`, background: domainFilter === d.value ? `${CC}14` : 'transparent', color: domainFilter === d.value ? CC : 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Role */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Looking for role</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <button onClick={() => setRoleFilter('')}
                    style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${!roleFilter ? CC : 'var(--border)'}`, background: !roleFilter ? `${CC}14` : 'transparent', color: !roleFilter ? CC : 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                    Any
                  </button>
                  {ROLE_FILTERS.map(r => (
                    <button key={r} onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
                      style={{ padding: '4px 12px', borderRadius: '20px', border: `1.5px solid ${roleFilter === r ? CC : 'var(--border)'}`, background: roleFilter === r ? `${CC}14` : 'transparent', color: roleFilter === r ? CC : 'var(--text-secondary)', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!isLoading && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader2 size={28} color={CC} style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users2 size={40} color="var(--text-faint)" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No projects found</p>
          <p style={{ fontSize: '13px' }}>Try different filters, or create the first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
          {filtered.map((p, i) => <ProjectCard key={p._id} post={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

/* ── My Projects tab ── */
function MyProjectsTab() {
  const { user } = useAuthStore();

  const {
    data: myPosts = [], isLoading: loadingPosts, isError: postsError, refetch: refetchPosts,
  } = useQuery({
    queryKey: ['my-collab-posts', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/posts', { params: { type: 'collab', author: user._id, limit: 30 } });
      return data.posts;
    },
    enabled: !!user,
  });

  const {
    data: myRequests = [], isLoading: loadingReqs, isError: reqsError, refetch: refetchReqs,
  } = useQuery({
    queryKey: ['my-collab-requests'],
    queryFn: async () => {
      const { data } = await api.get('/collab-requests/my');
      return data.requests;
    },
    enabled: !!user,
  });

  const accepted  = myRequests.filter(r => r.status === 'accepted');
  const pending   = myRequests.filter(r => r.status === 'pending');
  const isLoading = loadingPosts || loadingReqs;

  if (!user) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Log in to see your projects.</div>;

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader2 size={28} color={CC} style={{ animation: 'spin 0.8s linear infinite' }} /></div>;

  if (postsError || reqsError) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626', marginBottom: '6px' }}>Couldn't load your projects</p>
      <p style={{ fontSize: '13px', marginBottom: '16px' }}>Your session may have expired. Try refreshing, or log in again.</p>
      <button onClick={() => { refetchPosts(); refetchReqs(); }}
        className="collab-focusable"
        style={{ minHeight: '40px', padding: '8px 18px', borderRadius: '9px', border: 'none', background: CC, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Projects I lead */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: CC, display: 'inline-block' }} />
          Projects I Lead ({myPosts.length})
        </h2>
        {myPosts.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '20px', background: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            You haven't created any collab projects yet. Go to Explore and create a Collab post!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {myPosts.map((p, i) => <ProjectCard key={p._id} post={p} index={i} showReviewLink />)}
          </div>
        )}
      </section>

      {/* Projects I joined */}
      <section>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          Projects I Joined ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '20px', background: 'var(--card-bg)', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center' }}>
            You haven't been accepted into a project yet. Browse Discover and apply!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {accepted.map(r => (
              <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{r.post?.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.post?.projectName}</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontSize: '12px', fontWeight: '600' }}><CheckCircle2 size={12} /> Accepted</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
            Pending Requests ({pending.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pending.map(r => (
              <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>{r.post?.title}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.post?.projectName}</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(245,158,11,0.1)', color: '#d97706', fontSize: '12px', fontWeight: '600' }}><Clock size={12} /> Pending</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Workspace tab ── */
function WorkspaceTab() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  const {
    data: myRequests = [], isLoading, isError: reqsError, refetch: refetchReqs,
  } = useQuery({
    queryKey: ['my-collab-requests-workspace'],
    queryFn: async () => {
      const { data } = await api.get('/collab-requests/my');
      return data.requests;
    },
    enabled: !!user,
  });

  const accepted = myRequests.filter(r => r.status === 'accepted' && r.post);

  /* Also fetch collab posts I created */
  const {
    data: myPosts = [], isLoading: loadingPosts, isError: postsError, refetch: refetchPosts,
  } = useQuery({
    queryKey: ['my-collab-posts-ws', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/posts', { params: { type: 'collab', author: user._id, limit: 20 } });
      return data.posts;
    },
    enabled: !!user,
  });

  if (!user) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Log in to access your workspace.</p>;

  if (isLoading || loadingPosts) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <Loader2 size={28} color={CC} style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (reqsError || postsError) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <p style={{ fontSize: '15px', fontWeight: '600', color: '#dc2626', marginBottom: '6px' }}>Couldn't load your workspaces</p>
      <p style={{ fontSize: '13px', marginBottom: '16px' }}>Your session may have expired. Try refreshing, or log in again.</p>
      <button onClick={() => { refetchReqs(); refetchPosts(); }}
        className="collab-focusable"
        style={{ minHeight: '40px', padding: '8px 18px', borderRadius: '9px', border: 'none', background: CC, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  const allProjects = [
    ...myPosts.map(p => ({ id: p._id, title: p.projectName || p.title, role: 'Lead', domain: p.domain })),
    ...accepted.map(r => ({ id: r.post._id, title: r.post.projectName || r.post.title, role: 'Member', domain: r.post.domain })),
  ];

  if (allProjects.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
      <LayoutDashboard size={40} color="var(--text-faint)" style={{ marginBottom: '12px' }} />
      <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No active workspaces</p>
      <p style={{ fontSize: '13px' }}>Create a collab project or get accepted into one to access the task board.</p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
      {allProjects.map(proj => (
        <motion.div key={proj.id} whileHover={{ y: -2, boxShadow: `0 8px 24px ${CC}18` }}
          style={{ background: 'var(--card-bg)', border: `1px solid ${CC}25`, borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{proj.title}</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: proj.role === 'Lead' ? `${CC}14` : 'rgba(34,197,94,0.1)', color: proj.role === 'Lead' ? CC : '#16a34a' }}>{proj.role}</span>
                {proj.domain && <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-2)' }}>{proj.domain}</span>}
              </div>
            </div>
            <LayoutDashboard size={18} color={CC} style={{ flexShrink: 0, marginTop: '2px' }} />
          </div>
          <button onClick={() => navigate(`/project/${proj.id}`)}
            className="collab-focusable"
            style={{ width: '100%', minHeight: '44px', padding: '9px', borderRadius: '9px', border: 'none', background: CC, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', boxShadow: `0 3px 10px ${CC}30`, transition: 'transform 200ms ease, opacity 200ms ease' }}>
            Open Task Board →
          </button>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Main page ── */
const TABS = [
  { id: 'discover',   label: 'Discover',    icon: Compass       },
  { id: 'my',        label: 'My Projects', icon: Briefcase     },
  { id: 'workspace', label: 'Workspace',   icon: LayoutDashboard },
];

export default function CollabPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />

      {/* Hero header */}
      <div style={{
        background: `linear-gradient(135deg, ${CC}14 0%, transparent 60%)`,
        borderBottom: '1px solid var(--border)',
        padding: '28px 24px 0',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '9px', background: CC, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users2 size={17} color="#fff" />
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Collaboration Hub</h1>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Find projects to join, manage your team, and build together.
              </p>
            </div>
            <button onClick={() => navigate('/explore?create=collab')}
              className="collab-focusable"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '44px', padding: '9px 18px', borderRadius: '10px', border: 'none', background: CC, color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 14px ${CC}35` }}>
              <PenSquare size={14} /> Post a Project
            </button>
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: '0', borderBottom: 'none' }}>
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="collab-focusable"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    minHeight: '44px',
                    padding: '10px 20px', border: 'none', background: 'transparent',
                    borderBottom: active ? `2px solid ${CC}` : '2px solid transparent',
                    color: active ? CC : 'var(--text-secondary)',
                    fontSize: '14px', fontWeight: active ? '700' : '500',
                    cursor: 'pointer', transition: 'color 0.15s, border-color 0.15s', whiteSpace: 'nowrap',
                  }}>
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 48px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'discover'   && <DiscoverTab />}
            {activeTab === 'my'        && <MyProjectsTab />}
            {activeTab === 'workspace' && <WorkspaceTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .collab-focusable { cursor: pointer; }
        .collab-focusable:hover { opacity: 0.92; }
        .collab-focusable:focus-visible,
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
