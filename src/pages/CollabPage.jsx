import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users2, Compass, Briefcase, LayoutDashboard, Loader2, PenSquare, Sliders, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/collab/ProjectCard';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';
import { useMyWorkspaces } from '../hooks/useWorkspace';

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
          <Users2 size={40} color="var(--text-faint)" className="mb-3 mx-auto" />
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

  const { workspaces: allProjects, isLoading, isError } = useMyWorkspaces(user?._id);

  if (!user) return <p className="text-text-muted text-center p-10">Log in to access your workspace.</p>;

  if (isLoading) return (
    <div className="flex justify-center p-15">
      <Loader2 size={28} className="animate-spin text-accent" />
    </div>
  );

  if (isError) return (
    <div className="text-center px-5 py-15 text-text-muted">
      <p className="text-[15px] font-semibold text-red-500 mb-1.5">Couldn't load your workspaces</p>
      <p className="text-[13px] mb-4">Your session may have expired. Try refreshing, or log in again.</p>
      <Button size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['my-collab-requests-workspace'] })}>
        Retry
      </Button>
    </div>
  );

  if (allProjects.length === 0) return (
    <div className="text-center p-15 text-text-muted">
      <LayoutDashboard size={40} className="mb-3 mx-auto opacity-40 text-text-muted" />
      <p className="text-[15px] font-semibold text-text-primary mb-1.5">No active workspaces</p>
      <p className="text-[13px]">Create a collab project or get accepted into one to access the task board.</p>
    </div>
  );

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {allProjects.map((proj, i) => (
        <motion.div
          key={proj.id} 
          onClick={() => navigate(`/project/${proj.id}`)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.05, type: 'spring', stiffness: 100, damping: 20 }}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          className="group relative bg-card/90 backdrop-blur-sm rounded-4xl p-7 md:p-8 cursor-pointer overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-border/40"
        >
          {/* Subtle live status pulse */}
          <div className="absolute top-8 right-8 flex items-center justify-center">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
          </div>

          <div className="flex flex-col h-full justify-between gap-10">
            <div>
              <motion.div 
                className="w-12 h-12 rounded-[14px] bg-accent/10 flex items-center justify-center mb-6 border border-accent/20"
                variants={{
                  hover: { scale: 1.05, rotate: -5, backgroundColor: 'var(--accent-light)', borderColor: 'transparent' }
                }}
              >
                <LayoutDashboard size={22} className="text-accent group-hover:text-white transition-colors" />
              </motion.div>
              
              <h3 className="text-xl font-bold tracking-tight text-text-primary mb-3 pr-8 leading-snug">{proj.title}</h3>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-accent/10 text-accent border border-accent/20">
                  {proj.role}
                </span>
                {proj.domain && (
                  <span className="px-3 py-1 rounded-full text-[12px] text-text-secondary bg-surface-2 border border-border/50">
                    {proj.domain}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto pt-2">
              <span className="text-[14px] font-semibold text-text-muted transition-colors group-hover:text-text-primary">
                Open Task Board
              </span>
              <motion.div 
                variants={{
                  hover: { x: 5, scale: 1.1, backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'transparent' }
                }}
                className="w-10 h-10 rounded-full bg-surface-1 border border-border/60 flex items-center justify-center text-text-secondary transition-colors"
              >
                <ArrowRight size={18} />
              </motion.div>
            </div>
          </div>
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
          <div className="flex gap-0 overflow-x-auto scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id} onClick={() => setActiveTab(id)}
                  className={[
                    'flex items-center gap-1.5 min-h-11 px-3 sm:px-5 border-none bg-transparent text-sm cursor-pointer whitespace-nowrap shrink-0',
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
