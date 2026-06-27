import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users2, Compass, Briefcase, LayoutDashboard, Loader2, PenSquare, Sliders, CheckCircle2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/collab/ProjectCard';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axiosInstance';

const CC = '#3a3d4a';

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
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] min-h-11 flex items-center gap-2 px-3.5 rounded-[10px] border-[1.5px] border-border bg-card transition-colors duration-150 focus-within:border-[#3a3d4a]">
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, tech, roles…"
            className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm text-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 min-h-11 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap"
          style={{
            border: `1.5px solid ${showFilters ? CC : 'var(--border)'}`,
            background: showFilters ? `${CC}10` : 'var(--card-bg)',
            color: showFilters ? CC : 'var(--text-secondary)',
          }}
        >
          <Sliders size={14} /> Filters {(domainFilter || roleFilter) && '•'}
        </button>
      </div>

      {/* Filter pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 flex flex-col gap-3">
              {/* Domain */}
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Domain</p>
                <div className="flex flex-wrap gap-1.5">
                  {DOMAIN_FILTERS.map(d => (
                    <button
                      key={d.value} onClick={() => setDomainFilter(d.value)}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-120"
                      style={{
                        border: `1.5px solid ${domainFilter === d.value ? CC : 'var(--border)'}`,
                        background: domainFilter === d.value ? `${CC}14` : 'transparent',
                        color: domainFilter === d.value ? CC : 'var(--text-secondary)',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Role */}
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Looking for role</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setRoleFilter('')}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer"
                    style={{
                      border: `1.5px solid ${!roleFilter ? CC : 'var(--border)'}`,
                      background: !roleFilter ? `${CC}14` : 'transparent',
                      color: !roleFilter ? CC : 'var(--text-secondary)',
                    }}
                  >
                    Any
                  </button>
                  {ROLE_FILTERS.map(r => (
                    <button
                      key={r} onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-120"
                      style={{
                        border: `1.5px solid ${roleFilter === r ? CC : 'var(--border)'}`,
                        background: roleFilter === r ? `${CC}14` : 'transparent',
                        color: roleFilter === r ? CC : 'var(--text-secondary)',
                      }}
                    >
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
        <p className="text-[13px] text-text-muted mb-3.5">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center p-15">
          <Loader2 size={28} color={CC} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center px-5 py-15 text-text-muted">
          <Users2 size={40} color="var(--text-faint)" className="mb-3" />
          <p className="text-[15px] font-semibold text-text-primary mb-1.5">No projects found</p>
          <p className="text-[13px]">Try different filters, or create the first one!</p>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
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

  if (!user) return <div className="text-center p-15 text-text-muted">Log in to see your projects.</div>;

  if (isLoading) return <div className="flex justify-center p-15"><Loader2 size={28} color={CC} className="animate-spin" /></div>;

  if (postsError || reqsError) return (
    <div className="text-center px-5 py-15 text-text-muted">
      <p className="text-[15px] font-semibold text-error mb-1.5">Couldn't load your projects</p>
      <p className="text-[13px] mb-4">Your session may have expired. Try refreshing, or log in again.</p>
      <Button size="sm" onClick={() => { refetchPosts(); refetchReqs(); }}>
        Retry
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-7">
      {/* Projects I lead */}
      <section>
        <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: CC }} />
          Projects I Lead ({myPosts.length})
        </h2>
        {myPosts.length === 0 ? (
          <p className="text-[13px] text-text-muted p-5 bg-card border border-dashed border-border rounded-xl text-center">
            You haven't created any collab projects yet. Go to Explore and create a Collab post!
          </p>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {myPosts.map((p, i) => <ProjectCard key={p._id} post={p} index={i} showReviewLink />)}
          </div>
        )}
      </section>

      {/* Projects I joined */}
      <section>
        <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block bg-[#22c55e]" />
          Projects I Joined ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <p className="text-[13px] text-text-muted p-5 bg-card border border-dashed border-border rounded-xl text-center">
            You haven't been accepted into a project yet. Browse Discover and apply!
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {accepted.map(r => (
              <div key={r._id} className="bg-card border border-card-border rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary mb-0.5">{r.post?.title}</p>
                  <p className="text-xs text-text-muted">{r.post?.projectName}</p>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(34,197,94,0.1)] text-[#16a34a] text-xs font-semibold"><CheckCircle2 size={12} /> Accepted</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block bg-[#d97706]" />
            Pending Requests ({pending.length})
          </h2>
          <div className="flex flex-col gap-2.5">
            {pending.map(r => (
              <div key={r._id} className="bg-card border border-card-border rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary mb-0.5">{r.post?.title}</p>
                  <p className="text-xs text-text-muted">{r.post?.projectName}</p>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(245,158,11,0.1)] text-[#d97706] text-xs font-semibold"><Clock size={12} /> Pending</span>
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

  if (!user) return <p className="text-text-muted text-center p-10">Log in to access your workspace.</p>;

  if (isLoading || loadingPosts) return (
    <div className="flex justify-center p-15">
      <Loader2 size={28} color={CC} className="animate-spin" />
    </div>
  );

  if (reqsError || postsError) return (
    <div className="text-center px-5 py-15 text-text-muted">
      <p className="text-[15px] font-semibold text-error mb-1.5">Couldn't load your workspaces</p>
      <p className="text-[13px] mb-4">Your session may have expired. Try refreshing, or log in again.</p>
      <Button size="sm" onClick={() => { refetchReqs(); refetchPosts(); }}>
        Retry
      </Button>
    </div>
  );

  const allProjects = [
    ...myPosts.map(p => ({ id: p._id, title: p.projectName || p.title, role: 'Lead', domain: p.domain })),
    ...accepted.map(r => ({ id: r.post._id, title: r.post.projectName || r.post.title, role: 'Member', domain: r.post.domain })),
  ];

  if (allProjects.length === 0) return (
    <div className="text-center p-15 text-text-muted">
      <LayoutDashboard size={40} color="var(--text-faint)" className="mb-3" />
      <p className="text-[15px] font-semibold text-text-primary mb-1.5">No active workspaces</p>
      <p className="text-[13px]">Create a collab project or get accepted into one to access the task board.</p>
    </div>
  );

  return (
    <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {allProjects.map(proj => (
        <motion.div
          key={proj.id} whileHover={{ y: -2, boxShadow: `0 8px 24px ${CC}18` }}
          className="bg-card rounded-2xl p-5 flex flex-col gap-3 shadow-sm transition-shadow duration-200"
          style={{ border: `1px solid ${CC}25` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[15px] font-bold text-text-primary mb-1">{proj.title}</p>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: proj.role === 'Lead' ? `${CC}14` : 'rgba(34,197,94,0.1)', color: proj.role === 'Lead' ? CC : '#16a34a' }}>{proj.role}</span>
                {proj.domain && <span className="px-2 py-0.5 rounded-full text-[11px] text-text-muted bg-surface-2">{proj.domain}</span>}
              </div>
            </div>
            <LayoutDashboard size={18} color={CC} className="shrink-0 mt-0.5" />
          </div>
          <Button size="sm" fullWidth onClick={() => navigate(`/project/${proj.id}`)}>
            Open Task Board →
          </Button>
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
    <div className="min-h-svh bg-surface-0">
      <Navbar />

      {/* Hero header */}
      <div
        className="border-b border-border pt-7 px-6"
        style={{ background: `linear-gradient(135deg, ${CC}14 0%, transparent 60%)` }}
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: CC }}>
                  <Users2 size={17} color="#fff" />
                </div>
                <h1 className="text-[22px] font-extrabold text-text-primary tracking-[-0.5px]">Collaboration Hub</h1>
              </div>
              <p className="text-sm text-text-muted">
                Find projects to join, manage your team, and build together.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/explore?create=collab')} style={{ flexShrink: 0 }}>
              <PenSquare size={14} /> Post a Project
            </Button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id} onClick={() => setActiveTab(id)}
                  className={[
                    'flex items-center gap-1.5 min-h-11 px-5 border-none bg-transparent text-sm cursor-pointer whitespace-nowrap',
                    'transition-colors duration-150 border-b-2 hover:opacity-92',
                    'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
                    active ? 'font-bold' : 'font-medium',
                  ].join(' ')}
                  style={{ borderBottomColor: active ? CC : 'transparent', color: active ? CC : 'var(--text-secondary)' }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1100px] mx-auto px-6 pt-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'discover'   && <DiscoverTab />}
            {activeTab === 'my'        && <MyProjectsTab />}
            {activeTab === 'workspace' && <WorkspaceTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
