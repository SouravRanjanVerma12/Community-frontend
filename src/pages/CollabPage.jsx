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

const CC = '#6366f1';

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
        <div className="flex-1 min-w-[200px] min-h-11 flex items-center gap-2 px-4 rounded-xl border border-border bg-card transition-all duration-150 focus-within:border-indigo-400">
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
            background: showFilters ? 'rgba(99,102,241,0.12)' : 'var(--card-bg)',
            border: `1.5px solid ${showFilters ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
            color: showFilters ? '#818cf8' : 'var(--text-secondary)',
          }}
        >
          <Sliders size={14} /> Filters {hasFilters && <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />}
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
                        background: domainFilter === d.value ? 'rgba(99,102,241,0.12)' : 'transparent',
                        border: `1.5px solid ${domainFilter === d.value ? 'rgba(99,102,241,0.45)' : 'var(--border)'}`,
                        color: domainFilter === d.value ? '#818cf8' : 'var(--text-secondary)',
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
                          background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                          border: `1.5px solid ${active ? 'rgba(99,102,241,0.45)' : 'var(--border)'}`,
                          color: active ? '#818cf8' : 'var(--text-secondary)',
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <Handshake size={30} color="#818cf8" />
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

  if (isLoading) return (
    <div className="flex flex-col gap-7">
      <section>
        <Skeleton className="w-48 h-5 rounded-md mb-4" />
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      </section>
    </div>
  );

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
      {/* Collabs I lead */}
      <section>
        <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: CC }} />
          Collabs I Posted ({myPosts.length})
        </h2>
        {myPosts.length === 0 ? (
          <p className="text-[13px] text-text-muted p-5 bg-card border border-dashed border-border rounded-xl text-center">
            You haven't posted any collab opportunities yet. Go to Explore and post a Collab!
          </p>
        ) : (
          <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {myPosts.map((p, i) => <ProjectCard key={p._id} post={p} index={i} showReviewLink />)}
          </div>
        )}
      </section>

      {/* Collabs I joined */}
      <section>
        <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block bg-[#22c55e]" />
          Collabs I Joined ({accepted.length})
        </h2>
        {accepted.length === 0 ? (
          <p className="text-[13px] text-text-muted p-5 bg-card border border-dashed border-border rounded-xl text-center">
            You haven't been accepted into a collab yet. Browse Discover and apply!
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {accepted.map(r => (
              <div key={r._id} className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors cursor-pointer" onClick={() => navigate(`/project/${r.post?._id}`)}>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary mb-0.5">{r.post?.title}</p>
                  <p className="text-xs text-text-muted">{r.post?.projectName}</p>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ color: '#16a34a', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
                ><CheckCircle2 size={12} /> Accepted</span>
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
              <div key={r._id} className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary mb-0.5">{r.post?.title}</p>
                  <p className="text-xs text-text-muted">{r.post?.projectName}</p>
                </div>
                <span
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ color: '#d97706', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                ><Clock size={12} /> Pending</span>
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
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(3)].map((_, i) => <WorkspaceCardSkeleton key={i} />)}
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
    <div className="text-center p-20">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
      >
        <LayoutDashboard size={28} color="#6366f1" />
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
          className="group relative bg-card rounded-2xl p-6 cursor-pointer overflow-hidden border border-border transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/40"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          {/* Hover glow overlay */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            variants={{ hover: { boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 8px 28px rgba(99,102,241,0.08)' } }}
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
              {/* Icon container with indigo gradient */}
              <motion.div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 3px 10px rgba(99,102,241,0.25)' }}
                variants={{ hover: { scale: 1.08, rotate: -5 } }}
              >
                <LayoutDashboard size={20} className="text-white" />
              </motion.div>
              
              <h3 className="text-lg font-bold tracking-tight text-text-primary mb-3 pr-6 leading-snug">{proj.title}</h3>
              
              {/* Role + domain pills */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)' }}
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
              <span className="text-[13px] font-semibold text-text-muted transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                Open Task Board
              </span>
              <motion.div 
                variants={{ hover: { x: 4, scale: 1.1 } }}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-text-muted transition-all duration-150 group-hover:border-indigo-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:border-indigo-500/40 dark:group-hover:text-indigo-400 dark:group-hover:bg-indigo-500/10"
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

      {/* Hero header — immersive dark panel */}
      <div
        className="relative border-b pt-8 pb-0 px-6 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 40%, transparent 70%)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Ambient orb top-right */}
        <div
          className="absolute top-0 right-0 w-[420px] h-[220px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.18) 0%, transparent 65%)',
          }}
        />

        <div className="max-w-[1100px] mx-auto relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
              >
                <Handshake size={12} color="#818cf8" />
                <span className="text-[11px] font-semibold" style={{ color: '#818cf8' }}>Collaboration Hub</span>
              </div>

              <h1 className="text-[28px] font-extrabold tracking-[-0.6px] mb-2" style={{ color: 'var(--text-primary)' }}>
                Find your next build partner
              </h1>
              <p className="text-[14px] mb-4 max-w-md text-text-muted">
                Discover people to build with, post what you're working on, and get accepted into exciting collab opportunities.
              </p>

              {/* Live stats */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#818cf8' }} />
                  Open collabs
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#34d399' }} />
                  Builders active
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => navigate('/explore?create=collab')}
              whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold cursor-pointer border-none mt-1"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 4px 18px rgba(99,102,241,0.38)',
                flexShrink: 0,
              }}
            >
              <Handshake size={15} /> Post a Collab
            </motion.button>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0 overflow-x-auto scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={[
                    'flex items-center gap-1.5 min-h-11 px-4 sm:px-5 border-none bg-transparent text-[13px] cursor-pointer whitespace-nowrap shrink-0',
                    'transition-all duration-150 border-b-2',
                    active ? 'font-bold' : 'font-medium text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                  style={{
                    borderBottomColor: active ? '#818cf8' : 'transparent',
                    color: active ? '#818cf8' : 'var(--text-primary)',
                  }}
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
      <div className="max-w-[1100px] mx-auto px-6 pt-6 pb-12">
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
