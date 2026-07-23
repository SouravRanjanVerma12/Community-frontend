import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users2, Compass, Briefcase, LayoutDashboard, Loader2, Handshake, Sliders, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/collab/ProjectCard';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import api from '../api/axiosInstance';
import { queryClient } from '../api/queryClient';
import { useMyWorkspaces } from '../hooks/useWorkspace';
import { DEV_DOMAINS } from '../data/profileOptions';
import { Skeleton, ProjectCardSkeleton, WorkspaceCardSkeleton } from '../components/ui/Skeleton';

const CC = 'var(--accent, #1e9df1)';

const DOMAIN_FILTERS = [
  { value: '', label: 'All Domains' },
  { value: 'webdev',  label: 'Web Dev'      },
  { value: 'backend', label: 'Backend'      },
  { value: 'aiml',    label: 'AI / ML'      },
  { value: 'devops',  label: 'DevOps'       },
  { value: 'mobile',  label: 'Mobile'       },
  { value: 'oss',     label: 'Open Source'  },
];

const ROLE_FILTERS = DEV_DOMAINS.map((d) => d.label);

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
  const hasFilters = domainFilter || roleFilter;

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex gap-2.5 mb-3.5 flex-wrap">
        <div className="flex-1 min-w-[200px] min-h-11 flex items-center gap-2 px-4 rounded-xl border border-border bg-card transition-all duration-150 focus-within:border-accent-border">
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search collabs, tech, roles…"
            className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm text-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-1.5 min-h-11 px-4 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-150 whitespace-nowrap"
          style={{
            background: showFilters ? 'var(--accent-bg, rgba(30,157,241,0.12))' : 'var(--card-bg)',
            border: `1.5px solid ${showFilters ? 'var(--accent-border, rgba(30,157,241,0.4))' : 'var(--border)'}`,
            color: showFilters ? 'var(--accent, #1e9df1)' : 'var(--text-secondary)',
          }}
        >
          <Sliders size={14} /> Filters {hasFilters && <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
        </button>
      </div>

      {/* Filter pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }} className="overflow-hidden mb-4">
            <div className="rounded-xl px-4 py-4 flex flex-col gap-4 bg-card border border-border">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2.5 text-text-muted">Domain</p>
                <div className="flex flex-wrap gap-1.5">
                  {DOMAIN_FILTERS.map(d => (
                    <button
                      key={d.value}
                      onClick={() => setDomainFilter(d.value)}
                      className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-120"
                      style={{
                        background: domainFilter === d.value ? 'var(--accent-bg, rgba(30,157,241,0.12))' : 'transparent',
                        border: `1.5px solid ${domainFilter === d.value ? 'var(--accent-border, rgba(30,157,241,0.45))' : 'var(--border)'}`,
                        color: domainFilter === d.value ? 'var(--accent, #1e9df1)' : 'var(--text-secondary)',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2.5 text-text-muted">Looking for role</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Any', ...ROLE_FILTERS].map(r => {
                    const isAny = r === 'Any';
                    const active = isAny ? !roleFilter : roleFilter === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(isAny ? '' : roleFilter === r ? '' : r)}
                        className="px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all duration-120"
                        style={{
                          background: active ? 'var(--accent-bg, rgba(30,157,241,0.12))' : 'transparent',
                          border: `1.5px solid ${active ? 'var(--accent-border, rgba(30,157,241,0.45))' : 'var(--border)'}`,
                          color: active ? 'var(--accent, #1e9df1)' : 'var(--text-secondary)',
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {!isLoading && (
        <p className="text-[12px] font-medium mb-4 text-text-muted">
          {filtered.length} collab {filtered.length !== 1 ? 'opportunities' : 'opportunity'} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))' }}>
          {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center px-5 py-20">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-accent-bg border border-accent-border"
          >
            <Handshake size={30} className="text-accent" />
          </div>
          <p className="text-[16px] font-bold mb-1.5 text-text-primary">No collab opportunities yet</p>
          <p className="text-[13px] text-text-muted">Try different filters, or be the first to post one!</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))' }}>
          {filtered.map((p, i) => <ProjectCard key={p._id} post={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

/* ── My Collabs tab ── */
function MyProjectsTab() {
  const navigate = useNavigate();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['my-collab-posts'],
    queryFn: async () => {
      const { data } = await api.get('/posts/my/collabs');
      return data.posts;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] m-0">Collabs Posted By You</p>
        <Button size="sm" onClick={() => navigate('/explore?create=collab')}>
          + Post Collab
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))' }}>
          {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center px-5 py-16 bg-card border border-border rounded-2xl">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-accent-bg border border-accent-border"
          >
            <Handshake size={26} className="text-accent" />
          </div>
          <p className="text-base font-bold mb-1 text-text-primary">You haven't posted any collabs yet</p>
          <p className="text-xs text-text-muted mb-4">Need help on a side project? Post a collab call to find teammates.</p>
          <Button size="sm" onClick={() => navigate('/explore?create=collab')}>
            + Post your first collab
          </Button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))' }}>
          {posts.map((p, i) => <ProjectCard key={p._id} post={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

/* ── Workspace tab ── */
function WorkspaceTab() {
  const navigate = useNavigate();
  const { data: myPosts = [], isLoading: loadingMy } = useQuery({
    queryKey: ['my-collab-posts-ws'],
    queryFn: async () => {
      const { data } = await api.get('/posts/my/collabs');
      return data.posts;
    },
  });

  const { data: requests = [], isLoading: loadingReqs } = useQuery({
    queryKey: ['my-collab-requests-workspace'],
    queryFn: async () => {
      const { data } = await api.get('/collab-requests/my');
      return data.requests;
    },
  });

  const { data: joinedWorkspaces = [], isLoading: loadingWorkspaces } = useMyWorkspaces();

  const isLoading = loadingMy || loadingReqs || loadingWorkspaces;

  // Joined/accepted workspaces
  const acceptedProjects = joinedWorkspaces.map(w => ({
    id: w._id,
    title: w.name,
    role: 'Team Member',
    domain: w.post?.domain || 'Workspace',
    status: 'accepted',
    post: w.post,
  }));

  // Posts created by user
  const createdProjects = myPosts.map(p => ({
    id: p._id,
    title: p.projectName || p.title,
    role: 'Project Lead',
    domain: p.domain,
    status: 'creator',
    post: p,
  }));

  // Requests accepted for the user
  const acceptedRequestsProjects = requests
    .filter(r => r.status === 'accepted' && r.post)
    .map(r => ({
      id: r.post._id,
      title: r.post.projectName || r.post.title,
      role: 'Contributor',
      domain: r.post.domain,
      status: 'accepted',
      post: r.post,
    }));

  // Combined deduplicated active workspaces
  const allProjects = Array.from(
    new Map(
      [...createdProjects, ...acceptedProjects, ...acceptedRequestsProjects].map(p => [p.id, p])
    ).values()
  );

  if (isLoading) {
    return (
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(3)].map((_, i) => <WorkspaceCardSkeleton key={i} />)}
      </div>
    );
  }

  if (allProjects.length === 0) return (
    <div className="text-center px-5 py-16 bg-card border border-border rounded-2xl">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-accent-bg border border-accent-border"
      >
        <LayoutDashboard size={28} className="text-accent" />
      </div>
      <p className="text-[16px] font-bold text-text-primary mb-1.5">No active workspaces</p>
      <p className="text-[13px] text-text-muted">Post a collab or get accepted into one to access the task board.</p>
    </div>
  );

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {allProjects.map((proj, i) => (
        <motion.div
          key={proj.id} 
          onClick={() => navigate(`/project/${proj.id}`)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05, type: 'spring', stiffness: 120, damping: 22 }}
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          className="group relative bg-card rounded-2xl p-6 cursor-pointer overflow-hidden border border-border transition-all duration-200 hover:border-accent-border"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          {/* Hover glow overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            variants={{ hover: { boxShadow: '0 0 0 1px var(--accent-border), 0 8px 28px rgba(30,157,241,0.08)' } }}
            style={{ boxShadow: '0 0 0 0px transparent' }}
            transition={{ duration: 0.18 }}
          />

          {/* Live status pulse — top right */}
          <div className="absolute top-6 right-6 flex items-center justify-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#22c55e' }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22c55e' }} />
            </span>
          </div>

          <div className="flex flex-col h-full justify-between gap-8">
            <div>
              {/* Icon container with default blue gradient */}
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 bg-(image:--btn-grad) shadow-btn"
                variants={{ hover: { scale: 1.08, rotate: -5 } }}
              >
                <LayoutDashboard size={20} className="text-white" />
              </motion.div>
              
              <h3 className="text-lg font-bold tracking-tight text-text-primary mb-3 pr-6 leading-snug">{proj.title}</h3>
              
              {/* Role + domain pills */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[11px] font-semibold text-accent bg-accent-bg border border-accent-border"
                >
                  {proj.role}
                </span>
                {proj.domain && (
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-medium text-text-secondary bg-surface-2 border border-border">
                    {proj.domain}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom CTA row */}
            <div className="flex items-end justify-between mt-auto pt-1">
              <span className="text-[13px] font-semibold text-text-muted transition-colors group-hover:text-accent">
                Open Task Board
              </span>
              <motion.div 
                variants={{ hover: { x: 4, scale: 1.1 } }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-text-muted transition-all duration-150 group-hover:border-accent-border group-hover:text-accent group-hover:bg-accent-bg"
              >
                <ArrowRight size={16} />
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
  { id: 'discover',   label: 'Discover',    icon: Compass        },
  { id: 'my',        label: 'My Collabs',  icon: Handshake      },
  { id: 'workspace', label: 'Workspace',   icon: LayoutDashboard },
];

export default function CollabPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div className="min-h-svh" style={{ background: 'var(--surface-0)' }}>
      <Navbar />

      {/* Hero header */}
      <div
        className="relative border-b pt-5 sm:pt-8 pb-0 px-4 sm:px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(30,157,241,0.08) 0%, rgba(30,157,241,0.02) 40%, transparent 70%)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Ambient orb top-right */}
        <div
          className="absolute top-0 right-0 w-[420px] h-[220px] pointer-events-none opacity-60 sm:opacity-100"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(30,157,241,0.18) 0%, transparent 65%)',
          }}
        />

        <div className="max-w-[1100px] mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-2">
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2.5 sm:mb-3 bg-accent-bg border border-accent-border"
              >
                <Handshake size={12} className="text-accent" />
                <span className="text-[11px] font-semibold text-accent">Collab Hub</span>
              </div>

              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-[-0.6px] mb-1.5 sm:mb-2 text-text-primary">
                Stop building alone.
              </h1>
              <p className="text-[13px] sm:text-[14px] max-w-md text-text-secondary dark:text-text-muted leading-relaxed mb-3 sm:mb-0">
                Got an idea but no team? Need a dev, designer, or co-founder? Drop your project here — the right people will find you.
              </p>
            </div>

            <motion.button
              onClick={() => navigate('/explore?create=collab')}
              whileTap={{ scale: 0.97 }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold cursor-pointer border-none w-full sm:w-auto shrink-0 bg-(image:--btn-grad) shadow-btn mt-1 transition-all"
            >
              <Handshake size={15} /> Drop a project
            </motion.button>
          </div>

          {/* Segmented Control Tab bar */}
          <div className="flex gap-1.5 sm:gap-0 overflow-x-auto scrollbar-none my-2 sm:my-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={[
                    'flex items-center justify-center gap-1.5 min-h-10 sm:min-h-11 px-3.5 sm:px-5 border-none text-[13px] cursor-pointer whitespace-nowrap shrink-0 rounded-xl sm:rounded-none',
                    'transition-all duration-150',
                    active ? 'font-bold bg-accent-bg sm:bg-transparent text-accent sm:border-b-2 sm:border-accent' : 'font-medium bg-surface-1 sm:bg-transparent text-text-secondary hover:text-text-primary sm:border-b-2 sm:border-transparent',
                  ].join(' ')}
                >
                  <Icon size={14} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {activeTab === 'discover'   && <DiscoverTab />}
            {activeTab === 'my'        && <MyProjectsTab />}
            {activeTab === 'workspace' && <WorkspaceTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
