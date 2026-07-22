import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  Loader2, Users2, FolderKanban, Inbox, CheckCircle2,
  Clock, ArrowUpRight
} from 'lucide-react';
import { useOpenCollabPosts } from '../../hooks/usePosts';
import { useMyWorkspaces, useMyWorkspaceTaskStats } from '../../hooks/useWorkspace';
import { useMyCollabRequests } from '../../hooks/useCollabRequests';
import { useAuthStore } from '../../stores/authStore';

const TASK_STAT_COLORS = { todo: '#6b7280', in_progress: '#d97706', done: '#16a34a' };

function Section({ icon: Icon, title, extra, children, className = '' }) {
  return (
    <div className={`bg-card border border-card-border/80 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-250 hover:shadow-[0_6px_24px_rgba(0,0,0,0.04)] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-accent" />}
          <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-text-muted select-none">
            {title}
          </span>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center p-4">
      <Loader2 size={16} color="var(--text-muted)" className="animate-spin" />
    </div>
  );
}

function OpenCollabWidget() {
  const { data: posts, isLoading } = useOpenCollabPosts(5);
  return (
    <Section icon={Users2} title="Looking for Collaborators">
      {isLoading ? (
        <Spinner />
      ) : !posts?.length ? (
        <p className="text-[13px] text-text-muted">No open projects right now.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/project/${post._id}`}
              className="p-2.5 rounded-xl border border-border/50 bg-card hover:bg-hover/60 hover:border-accent/30 no-underline transition-all duration-200 group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                  {post.projectName || post.title}
                </span>
                <ArrowUpRight size={12} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
              </div>
              {post.rolesNeeded?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.rolesNeeded.slice(0, 3).map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent-dim text-accent border border-accent/20"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

function MyWorkspacesWidget({ workspaces, isLoading }) {
  return (
    <Section icon={FolderKanban} title="Active Workspaces">
      {isLoading ? (
        <Spinner />
      ) : !workspaces.length ? (
        <p className="text-[13px] text-text-muted">No active workspaces yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {workspaces.map((w) => (
            <Link
              key={w.id}
              to={`/project/${w.id}`}
              className="flex items-center gap-2.5 p-2 rounded-xl border border-border/40 hover:border-border hover:bg-hover/50 no-underline transition-all duration-150 group"
            >
              <div className="w-6 h-6 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-accent transition-colors shrink-0">
                <FolderKanban size={13} />
              </div>
              <span className="text-[13px] font-medium text-text-secondary group-hover:text-text-primary transition-colors flex-1 truncate">
                {w.title}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  w.role === 'Lead'
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'bg-surface-2 text-text-muted border border-border/60'
                }`}
              >
                {w.role}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}

function MyCollabRequestsWidget({ userId }) {
  const { data: requests, isLoading } = useMyCollabRequests(userId);
  const pending = (requests ?? []).filter((r) => r.status === 'pending').length;
  const accepted = (requests ?? []).filter((r) => r.status === 'accepted').length;
  return (
    <Section icon={Inbox} title="Collab Requests">
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold font-mono text-text-primary leading-none mb-0.5">{pending}</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider truncate">Pending</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={14} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400 leading-none mb-0.5">{accepted}</span>
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider truncate">Accepted</span>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

function TaskProgressWidget({ workspaces }) {
  const { taskStats, isLoading } = useMyWorkspaceTaskStats(workspaces);
  const total = taskStats.todo + taskStats.in_progress + taskStats.done;
  const slices = [
    { id: 'todo', label: 'To Do', value: taskStats.todo, color: TASK_STAT_COLORS.todo },
    { id: 'in_progress', label: 'In Progress', value: taskStats.in_progress, color: TASK_STAT_COLORS.in_progress },
    { id: 'done', label: 'Done', value: taskStats.done, color: TASK_STAT_COLORS.done },
  ];
  return (
    <Section
      icon={CheckCircle2}
      title="Task Progress"
      extra={
        total > 0 && (
          <span className="text-[10px] font-mono font-bold text-text-muted bg-surface-2 px-1.5 py-0.5 rounded-full">
            {total} tasks
          </span>
        )
      }
    >
      {isLoading ? (
        <Spinner />
      ) : total === 0 ? (
        <p className="text-[13px] text-text-muted">No tasks yet.</p>
      ) : (
        <div className="flex flex-col items-center gap-3 mt-1">
          <div className="relative flex items-center justify-center">
            <PieChart
              series={[{
                data: slices,
                innerRadius: 36,
                outerRadius: 62,
                paddingAngle: 3,
                cornerRadius: 4,
              }]}
              width={150}
              height={150}
              slotProps={{ legend: { hidden: true } }}
              tooltip={{ trigger: 'item' }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-sm font-extrabold font-mono text-text-primary">{total}</span>
              <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full pt-1 border-t border-divider/40">
            {slices.map((s) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              return (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-text-secondary font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-text-primary">{s.value}</span>
                    <span className="text-[10px] text-text-muted">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}

export default function LeftSidebar() {
  const { user } = useAuthStore();
  const { workspaces, isLoading: workspacesLoading } = useMyWorkspaces(user?._id);

  return (
    <aside className="hidden lg:flex sticky top-[112px] h-[calc(100svh-112px)] overflow-y-auto w-64 shrink-0 flex-col gap-4 pb-8 scrollbar-none">
      <OpenCollabWidget />

      {user && (
        <>
          <MyWorkspacesWidget workspaces={workspaces} isLoading={workspacesLoading} />
          <MyCollabRequestsWidget userId={user._id} />
          <TaskProgressWidget workspaces={workspaces} />
        </>
      )}
    </aside>
  );
}
