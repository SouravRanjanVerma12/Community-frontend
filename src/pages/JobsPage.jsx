import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase, Compass, ClipboardCheck, Loader2, PenSquare, Sliders, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import JobCard from '../components/jobs/JobCard';
import PostJobModal from '../components/jobs/PostJobModal';
import Button from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';
import { useJobs, useMyApplications } from '../hooks/useJobs';

const JC = '#1e9df1';

const WORK_MODE_FILTERS = [
  { value: '', label: 'Any mode' },
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const EMPLOYMENT_FILTERS = [
  { value: '', label: 'Any type' },
  { value: 'full-time',  label: 'Full-time'  },
  { value: 'part-time',  label: 'Part-time'  },
  { value: 'contract',   label: 'Contract'   },
  { value: 'internship', label: 'Internship' },
];

const APPLICATION_STATUS_STYLES = {
  pending:  { bg: 'rgba(245,158,11,0.1)', color: '#d97706', icon: Clock,       label: 'Pending'  },
  accepted: { bg: 'rgba(34,197,94,0.1)',  color: '#16a34a', icon: CheckCircle2, label: 'Accepted' },
  rejected: { bg: 'rgba(239,68,68,0.1)',  color: '#dc2626', icon: XCircle,     label: 'Rejected' },
};

/* ── Discover tab ── */
function DiscoverTab() {
  const [search,         setSearch]         = useState('');
  const [workMode,       setWorkMode]       = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [location,       setLocation]       = useState('');
  const [showFilters,    setShowFilters]    = useState(false);

  const { user } = useAuthStore();
  const { data: applications = [] } = useMyApplications(!!user);
  const { data: jobs = [], isLoading } = useJobs({ workMode, employmentType, location, search });

  const appliedJobIds = new Set(applications.map((a) => a.job?._id));

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] min-h-11 flex items-center gap-2 px-3.5 rounded-[10px] border-[1.5px] border-border bg-card transition-colors duration-150 focus-within:border-[#1e9df1]">
          <Search size={14} color="var(--text-muted)" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, companies, skills…"
            className="flex-1 py-2.5 bg-transparent border-none outline-none text-sm text-text-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 min-h-11 px-4 rounded-[10px] text-[13px] font-medium cursor-pointer transition-colors duration-150 whitespace-nowrap"
          style={{
            border: `1.5px solid ${showFilters ? JC : 'var(--border)'}`,
            background: showFilters ? `${JC}10` : 'var(--card-bg)',
            color: showFilters ? JC : 'var(--text-secondary)',
          }}
        >
          <Sliders size={14} /> Filters {(workMode || employmentType || location) && '•'}
        </button>
      </div>

      {/* Filter pills */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden mb-4">
            <div className="bg-card border border-border rounded-xl px-4 py-3.5 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Work mode</p>
                <div className="flex flex-wrap gap-1.5">
                  {WORK_MODE_FILTERS.map((m) => (
                    <button
                      key={m.value} onClick={() => setWorkMode(m.value)}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-120"
                      style={{
                        border: `1.5px solid ${workMode === m.value ? JC : 'var(--border)'}`,
                        background: workMode === m.value ? `${JC}14` : 'transparent',
                        color: workMode === m.value ? JC : 'var(--text-secondary)',
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Employment type</p>
                <div className="flex flex-wrap gap-1.5">
                  {EMPLOYMENT_FILTERS.map((t) => (
                    <button
                      key={t.value} onClick={() => setEmploymentType(t.value)}
                      className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-120"
                      style={{
                        border: `1.5px solid ${employmentType === t.value ? JC : 'var(--border)'}`,
                        background: employmentType === t.value ? `${JC}14` : 'transparent',
                        color: employmentType === t.value ? JC : 'var(--text-secondary)',
                      }}
                    >
                      {t.label}
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
          {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center p-15">
          <Loader2 size={28} color={JC} className="animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center px-5 py-15 text-text-muted">
          <Briefcase size={40} color="var(--text-faint)" className="mb-3 mx-auto" />
          <p className="text-[15px] font-semibold text-text-primary mb-1.5">No jobs found</p>
          <p className="text-[13px]">Try different filters, or post the first opening!</p>
        </div>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))' }}>
          {jobs.map((j, i) => <JobCard key={j._id} job={j} index={i} applied={appliedJobIds.has(j._id)} />)}
        </div>
      )}
    </div>
  );
}

/* ── My Postings tab ── */
function MyPostingsTab() {
  const { user } = useAuthStore();
  const { data: myJobs = [], isLoading } = useJobs({ postedBy: user?._id });

  if (!user) return <div className="text-center p-15 text-text-muted">Log in to see your job postings.</div>;
  if (isLoading) return <div className="flex justify-center p-15"><Loader2 size={28} color={JC} className="animate-spin" /></div>;

  return (
    <div>
      <h2 className="text-[15px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: JC }} />
        Jobs You Posted ({myJobs.length})
      </h2>
      {myJobs.length === 0 ? (
        <p className="text-[13px] text-text-muted p-5 bg-card border border-dashed border-border rounded-xl text-center">
          You haven't posted any jobs yet. Click "Post a Job" to get started!
        </p>
      ) : (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))' }}>
          {myJobs.map((j, i) => <JobCard key={j._id} job={j} index={i} showReviewLink />)}
        </div>
      )}
    </div>
  );
}

/* ── My Applications tab ── */
function MyApplicationsTab() {
  const { user } = useAuthStore();
  const { data: applications = [], isLoading } = useMyApplications(!!user);

  if (!user) return <div className="text-center p-15 text-text-muted">Log in to see your applications.</div>;
  if (isLoading) return <div className="flex justify-center p-15"><Loader2 size={28} color={JC} className="animate-spin" /></div>;

  if (applications.length === 0) return (
    <div className="text-center px-5 py-15 text-text-muted">
      <ClipboardCheck size={40} color="var(--text-faint)" className="mb-3 mx-auto" />
      <p className="text-[15px] font-semibold text-text-primary mb-1.5">No applications yet</p>
      <p className="text-[13px]">Browse Discover and apply to a job that fits you.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {applications.map((a, i) => {
        const s = APPLICATION_STATUS_STYLES[a.status];
        const Icon = s.icon;
        return (
          <motion.div 
            key={a._id} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4, type: 'spring', stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.01 }}
            className="group bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] transition-all cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
              <ClipboardCheck size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-text-primary tracking-tight mb-0.5 group-hover:text-accent transition-colors">{a.job?.title}</p>
              <p className="text-[13px] text-text-muted font-medium">{a.job?.company} {a.job?.location && <span className="opacity-60">· {a.job.location}</span>}</p>
            </div>
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold" style={{ background: `${s.bg}90`, color: s.color, border: `1px solid ${s.color}25` }}>
              <Icon size={14} /> {s.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Main page ── */
const TABS = [
  { id: 'discover',     label: 'Discover',         icon: Compass        },
  { id: 'postings',     label: 'My Postings',      icon: Briefcase      },
  { id: 'applications', label: 'My Applications',  icon: ClipboardCheck },
];

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('discover');
  const [postModalOpen, setPostModalOpen] = useState(false);

  return (
    <div className="min-h-svh bg-surface-0">
      <Navbar />

      {/* Hero header */}
      <div
        className="border-b border-border pt-7 px-6"
        style={{ background: `linear-gradient(135deg, ${JC}14 0%, transparent 60%)` }}
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: JC }}>
                  <Briefcase size={17} color="#fff" />
                </div>
                <h1 className="text-[22px] font-extrabold text-text-primary tracking-[-0.5px]">Jobs &amp; Opportunities</h1>
              </div>
              <p className="text-sm text-text-muted">
                Find your next role, or hire from the community.
              </p>
            </div>
            <Button size="sm" onClick={() => setPostModalOpen(true)} style={{ flexShrink: 0 }}>
              <PenSquare size={14} /> Post a Job
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
                  style={{ borderBottomColor: active ? JC : 'transparent', color: active ? JC : 'var(--text-secondary)' }}
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
            {activeTab === 'discover'     && <DiscoverTab />}
            {activeTab === 'postings'     && <MyPostingsTab />}
            {activeTab === 'applications' && <MyApplicationsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {postModalOpen && <PostJobModal onClose={() => setPostModalOpen(false)} />}
    </div>
  );
}
