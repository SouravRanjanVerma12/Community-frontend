import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { confirm } from '../components/ui/ConfirmDialog';
import {
  ArrowLeft, LayoutDashboard, CheckSquare, Users, MessageSquare,
  BookOpen, Plus, Trash2, Send, ExternalLink, Loader2,
  Code, Palette, FileText, Globe, Link2,
  CheckCircle, Clock, Circle, Wifi, WifiOff, Edit, Share2,
  Square, X, Crown, User, Eye, Calendar, Paperclip,
  ClipboardCheck, RotateCcw, Settings as SettingsIcon,
  Award, Upload, CheckCircle2, XCircle, AlertCircle, FileImage, ShieldCheck,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { LinkedInIcon } from '../components/icons/LinkedInIcon';
import api from '../api/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import { getSocket, useSocketStore } from '../stores/socketStore';
import { DOMAINS } from '../data/mockPosts';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  useWorkspaceOverview, useWorkspaceActivity, useWorkspaceMembers,
  useWorkspaceResources, useWorkspaceTasks, useWorkspaceEndorsements, invalidateWorkspace,
} from '../hooks/useWorkspace';

/* ── shared helpers ── */
const CC = '#3a3d4a';

const fieldClasses = 'w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none font-[inherit] transition-colors duration-150 focus:border-[#3a3d4a]';

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover border-2 border-border shrink-0" />;
  return <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.36 }} className="rounded-full text-white flex items-center justify-center font-bold border-2 border-border shrink-0">{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

const RESOURCE_ICONS = {
  github: { icon: Code,     color: '#8b8f9c', label: 'GitHub'  },
  figma:  { icon: Palette,  color: '#a259ff', label: 'Figma'   },
  docs:   { icon: FileText, color: '#2563eb', label: 'Docs'    },
  deploy: { icon: Globe,    color: '#059669', label: 'Deploy'  },
  other:  { icon: Link2,    color: '#6b7280', label: 'Link'    },
};

/* ── Loader ── */
function Loader() {
  return <div className="flex justify-center p-15"><Loader2 size={24} color={CC} className="animate-spin" /></div>;
}

/* ── Overview section ── */

function Overview({ postId, isOwner, onEdit }) {
  const { data, isLoading: loading } = useWorkspaceOverview(postId);
  const { data: recentActivity = [] } = useWorkspaceActivity(postId, 5);
  const [markingComplete, setMarkingComplete] = useState(false);

  if (loading) return <Loader />;
  if (!data) return null;

  const { post, taskStats, memberCount, msgCount, recentResources } = data;
  const totalTasks = taskStats.todo + taskStats.in_progress + taskStats.done;
  const progress = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;
  const allTasksDone = progress === 100 && totalTasks > 0; // task-board completion, distinct from post.projectStatus
  const isComplete = allTasksDone;
  const isProjectMarkedComplete = post.projectStatus === 'completed';

  const handleMarkComplete = async () => {
    if (!await confirm('Mark this project as complete? You should review every member for endorsement first.', { title: 'Mark Complete', confirmLabel: 'Mark Complete' })) return;
    setMarkingComplete(true);
    try {
      await api.patch(`/workspace/${postId}/complete`);
      invalidateWorkspace(postId);
      toast.success('Project marked complete.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark project complete.');
    } finally {
      setMarkingComplete(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Project Header Card */}
      <div
        className="bg-card rounded-2xl px-7 py-6 relative overflow-hidden"
        style={{ border: `1px solid ${isComplete ? '#16a34a' : CC}28` }}
      >
        {/* Status ribbon */}
        {isComplete && (
          <div className="absolute top-3 -right-7 px-10 py-1 bg-[#16a34a] text-white text-[11px] font-bold uppercase rotate-45 tracking-[1px]">
            Completed
          </div>
        )}

        <div className="flex justify-between items-start flex-wrap gap-3">
          <div className="flex-1">
            {post.projectName && (
              <p className="text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: CC }}>
                {post.projectName}
              </p>
            )}
            <h2 className="text-[22px] font-extrabold text-text-primary mb-2 tracking-[-0.3px]">
              {post.title}
            </h2>
            {post.body && (
              <p className="text-sm text-text-secondary leading-[1.7] mb-3 max-w-[600px]">
                {post.body}
              </p>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              {post.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.techStack.map(t => (
                    <span key={t} className="px-3 py-1 rounded-md bg-surface-2 text-text-secondary text-xs font-mono border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: isOwner ? `${CC}14` : 'rgba(107,114,128,0.1)', color: isOwner ? CC : 'var(--text-muted)', border: `1px solid ${isOwner ? CC + '35' : 'var(--border)'}` }}
              >
                {isOwner ? <Crown size={11} /> : <User size={11} />} {isOwner ? 'Owner' : 'Member'}
              </span>
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: isComplete ? 'rgba(22,163,74,0.12)' : 'rgba(8,145,178,0.12)', color: isComplete ? '#16a34a' : CC, border: `1px solid ${isComplete ? 'rgba(22,163,74,0.2)' : CC + '35'}` }}
              >
                {isComplete ? <CheckCircle size={11} /> : <Clock size={11} />} {isComplete ? 'Complete' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          {isOwner && (
            <div className="flex gap-1.5 shrink-0">
              {isProjectMarkedComplete ? (
                <span className="px-3.5 py-2 rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a] text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} /> Completed
                </span>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="px-3.5 py-2 rounded-lg border border-border bg-transparent text-text-secondary text-xs cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:border-[#16a34a] hover:text-[#16a34a] disabled:opacity-60"
                >
                  <CheckCircle size={14} /> {markingComplete ? 'Marking...' : 'Mark Project Complete'}
                </button>
              )}
              <button
                onClick={onEdit}
                className="px-3.5 py-2 rounded-lg border border-border bg-transparent text-text-secondary text-xs cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:border-[#3a3d4a] hover:text-[#3a3d4a]"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Workspace link copied to clipboard.');
                  } catch {
                    toast.error('Could not copy link.');
                  }
                }}
                className="px-3.5 py-2 rounded-lg border border-border bg-transparent text-text-secondary text-xs cursor-pointer flex items-center gap-1.5 transition-colors duration-150 hover:border-[#3a3d4a] hover:text-[#3a3d4a]"
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {[
          { icon: Users, label: 'Members', value: memberCount, color: CC, suffix: '' },
          { icon: CheckSquare, label: 'Total Tasks', value: totalTasks, color: '#d97706', suffix: '' },
          { icon: CheckCircle, label: 'Completed', value: taskStats.done, color: '#16a34a', suffix: `of ${totalTasks}` },
          { icon: MessageSquare, label: 'Messages', value: msgCount, color: '#8b5cf6', suffix: '' },
          { icon: Clock, label: 'Progress', value: `${progress}%`, color: progress === 100 ? '#16a34a' : CC, suffix: '' },
        ].map(({ icon: Icon, label, value, color, suffix }) => (
          <div
            key={label}
            className="bg-card border border-card-border rounded-xl px-5 py-4.5 flex flex-col gap-1.5 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5"
            style={{ '--hover-border': `${color}40` }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color + '40'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)'; }}
          >
            <div className="flex items-center gap-2">
              <Icon size={18} color={color} />
              <span className="text-xl font-extrabold text-text-primary">
                {value}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted">{label}</span>
              {suffix && <span className="text-[10px] text-text-muted">{suffix}</span>}
            </div>
            {label === 'Progress' && (
              <div className="mt-1 h-1 rounded-sm bg-surface-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-sm"
                  style={{ background: progress === 100 ? '#16a34a' : CC }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout: Progress + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Task Progress Breakdown */}
        {totalTasks > 0 && (
          <div className="bg-card border border-card-border rounded-xl px-5.5 py-5">
            <div className="flex justify-between items-center mb-3.5">
              <span className="text-sm font-bold text-text-primary">
                Task Breakdown
              </span>
              <span className="text-xs text-text-muted">
                {taskStats.done} / {totalTasks} done
              </span>
            </div>
            <div className="flex items-center gap-4">
              <PieChart
                series={[{
                  data: [
                    { id: 0, label: 'To Do',        value: taskStats.todo,        color: '#6b7280' },
                    { id: 1, label: 'In Progress',  value: taskStats.in_progress, color: '#d97706' },
                    { id: 2, label: 'Done',         value: taskStats.done,        color: '#16a34a' },
                  ],
                  innerRadius: 28,
                  outerRadius: 50,
                  paddingAngle: 2,
                  cornerRadius: 3,
                }]}
                width={120}
                height={120}
                slotProps={{ legend: { hidden: true } }}
                sx={{ flexShrink: 0 }}
              />
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { label: 'To Do', value: taskStats.todo, color: '#6b7280', icon: Circle },
                  { label: 'In Progress', value: taskStats.in_progress, color: '#d97706', icon: Clock },
                  { label: 'Done', value: taskStats.done, color: '#16a34a', icon: CheckCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={13} color={color} />
                    <span className="text-xs text-text-secondary flex-1">
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-card border border-card-border rounded-xl px-5.5 py-5">
          <div className="flex justify-between items-center mb-3.5">
            <span className="text-sm font-bold text-text-primary">
              Recent Activity
            </span>
            <span className="text-[11px] cursor-pointer" style={{ color: CC }}>View all →</span>
          </div>
          {recentActivity.length === 0 ? (
            <div className="text-center p-5 text-text-muted">
              <p className="text-[13px]">No recent activity yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {recentActivity.map((act, i) => (
                <div
                  key={act._id || i}
                  className={`flex items-center gap-2.5 py-1.5 ${i < recentActivity.length - 1 ? 'border-b border-divider' : ''}`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: act.type === 'task_created' ? '#8b5cf6' :
                                act.type === 'task_completed' ? '#16a34a' :
                                act.type === 'member_joined' ? '#0891b2' : '#6b7280',
                    }}
                  />
                  <span className="text-[13px] text-text-secondary flex-1">
                    {act.text || act.message}
                  </span>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {timeAgo(act.createdAt || act.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Resources */}
      {recentResources?.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl px-5.5 py-4.5">
          <div className="flex justify-between items-center mb-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-text-primary">
              <Paperclip size={14} /> Recent Resources
            </span>
            <span className="text-[11px] cursor-pointer" style={{ color: CC }}>View all →</span>
          </div>
          <div className="flex flex-col gap-1">
            {recentResources.slice(0, 4).map((r, i) => {
              const { icon: Icon, color } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
              return (
                <a
                  key={r._id || i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'flex items-center gap-2.5 py-2 no-underline text-text-primary',
                    'transition-[color,padding-left] duration-150 hover:pl-1',
                    i < Math.min(recentResources.length, 4) - 1 ? 'border-b border-divider' : '',
                  ].join(' ')}
                  style={{ '--hover-color': CC }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = CC; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                >
                  <Icon size={15} color={color} />
                  <span className="text-[13px] font-medium flex-1">
                    {r.title}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {timeAgo(r.createdAt || r.uploadedAt)}
                  </span>
                  <ExternalLink size={12} color="var(--text-muted)" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Members section ── */

function Members({ postId, isOwner }) {
  const { user: currentUser } = useAuthStore();
  const { data: members = [], isLoading: loading } = useWorkspaceMembers(postId);
  const membersQueryKey = ['workspace', postId, 'members'];
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');
  const [inviting, setInviting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [sortBy, setSortBy] = useState('joinedAt'); // joinedAt, name, role

  // Listen for online/offline events from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onUserOnline = ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    };
    const onUserOffline = ({ userId }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    // Request current online users
    socket.emit('users:online:request');

    socket.on('users:online', ({ userIds }) => {
      setOnlineUsers(new Set(userIds));
    });
    socket.on('user:online', onUserOnline);
    socket.on('user:offline', onUserOffline);

    return () => {
      socket.off('users:online');
      socket.off('user:online', onUserOnline);
      socket.off('user:offline', onUserOffline);
    };
  }, []);

  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.user.name.localeCompare(b.user.name);
      case 'role': {
        const roleOrder = { Lead: 0, Contributor: 1, Viewer: 2 };
        return (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
      }
      case 'joinedAt':
      default:
        return new Date(b.joinedAt) - new Date(a.joinedAt);
    }
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await api.post(`/workspace/${postId}/members/invite`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      queryClient.invalidateQueries({ queryKey: membersQueryKey });
      setInviteEmail('');
      setIsInviteModalOpen(false);
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!await confirm(`Change this member's role to ${newRole}?`, { title: 'Change role', danger: false, confirmLabel: 'Change role' })) return;
    try {
      await api.patch(`/workspace/${postId}/members/${userId}/role`, { role: newRole });
      queryClient.setQueryData(membersQueryKey, (prev = []) => prev.map(m =>
        m.user._id === userId ? { ...m, role: newRole } : m
      ));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!await confirm(`Remove ${userName} from this project?`, { title: 'Remove member', confirmLabel: 'Remove' })) return;
    try {
      await api.delete(`/workspace/${postId}/members/${userId}`);
      queryClient.setQueryData(membersQueryKey, (prev = []) => prev.filter(m => m.user._id !== userId));
      toast.success(`${userName} removed from the project`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <Loader />;

  const roleColors = {
    Lead: { bg: `${CC}18`, color: CC, icon: Crown },
    Contributor: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a', icon: User },
    Viewer: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', icon: Eye },
  };

  const leadCount = members.filter(m => m.role === 'Lead').length;
  const contributorCount = members.filter(m => m.role === 'Contributor').length;
  const viewerCount = members.filter(m => m.role === 'Viewer').length;
  const onlineCount = members.filter(m => onlineUsers.has(m.user._id)).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 py-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </span>
          {onlineCount > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {onlineCount} online
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-input text-xs text-text-secondary outline-none cursor-pointer"
          >
            <option value="joinedAt">Sort: Joined</option>
            <option value="name">Sort: Name</option>
            <option value="role">Sort: Role</option>
          </select>
          {isOwner && (
            <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
              <Plus size={14} /> Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Clean Member Cards */}
      <div className="flex flex-col gap-2">
        {sortedMembers.map(({ user, role, joinedAt }) => {
          const isOnline = onlineUsers.has(user._id);
          const roleInfo = roleColors[role] || roleColors.Contributor;
          const isCurrentUser = user._id === currentUser?._id;
          const linkedinUrl = getValidLinkedinUrl(user.socialLinks?.linkedin);

          return (
            <div
              key={user._id}
              className="bg-card border border-border/70 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:border-border"
            >
              {/* Left: Avatar + Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <Link to={`/profile/${user._id}`}>
                    <Avatar name={user.name} src={user.avatarUrl} size={42} />
                  </Link>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/profile/${user._id}`} className="no-underline text-text-primary hover:text-accent font-bold text-sm truncate">
                      {user.name}
                    </Link>
                    {isCurrentUser && (
                      <span className="text-[10px] text-text-muted bg-surface-2 px-1.5 py-px rounded shrink-0 font-medium">
                        You
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0" style={{ background: roleInfo.bg, color: roleInfo.color }}>
                      <roleInfo.icon size={10} /> {role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                    <span>@{user.username}</span>
                    <span>·</span>
                    <span>joined {timeAgo(joinedAt)}</span>
                    {linkedinUrl && (
                      <>
                        <span>·</span>
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#0A66C2] dark:text-[#3891e8] font-semibold hover:underline no-underline"
                        >
                          <LinkedInIcon className="w-3 h-3 fill-current shrink-0" />
                          <span>LinkedIn</span>
                          <ExternalLink size={10} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              {isOwner && !isCurrentUser && (
                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto">
                  <select
                    value={role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-border bg-input text-xs text-text-secondary outline-none cursor-pointer"
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(user._id, user.name)}
                    className="px-3 py-1 rounded-lg border border-error-border bg-transparent text-error text-xs font-semibold cursor-pointer hover:bg-error-bg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {members.length === 0 && (
        <div className="text-center px-5 py-12 bg-surface-2 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center">
          <Users size={48} className="mb-3 opacity-30 text-text-muted mx-auto block" />
          <p className="text-base font-semibold text-text-primary mb-1 text-center">
            No members yet
          </p>
          <p className="text-sm text-text-muted text-center max-w-sm">
            {isOwner ? 'Invite your team members to start collaborating.' : 'The project owner will add members soon.'}
          </p>
          {isOwner && (
            <Button size="sm" style={{ marginTop: '16px' }} onClick={() => setIsInviteModalOpen(true)}>
              <Plus size={14} /> Invite first member
            </Button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsInviteModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-300 p-0 sm:p-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-t-[28px] sm:rounded-[24px] max-w-[460px] w-full max-h-[92vh] sm:max-h-[88vh] overflow-y-auto scrollbar-none px-5 sm:px-7 pt-4 sm:pt-6 pb-6 border-t sm:border border-border/50 shadow-[0_-12px_40px_rgba(0,0,0,0.4)] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)]"
            >
              {/* Mobile handle indicator */}
              <div className="w-10 h-1 rounded-full bg-border/80 mx-auto mt-2 mb-3 sm:hidden shrink-0" />

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                  Invite Member
                </h2>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full border border-border/50 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    Email or Username <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email or username..."
                    onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                    className={fieldClasses}
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Enter the email address or username of the person you want to invite.
                  </p>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className={`${fieldClasses} cursor-pointer min-h-[42px]`}
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <p className="text-[11px] text-text-muted mt-1">
                    {inviteRole === 'Contributor' ? 'Can create and update tasks' : 'Can only view tasks and discussions'}
                  </p>
                </div>

                <div className="flex gap-3 justify-end border-t border-border/40 pt-5 mt-2">
                  <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)} className="flex-1 sm:flex-initial">
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting} isLoading={inviting} className="flex-1 sm:flex-initial">
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Endorsements — lead reviews each accepted member for a LinkedIn
   endorsement (endorse, optionally with a proof screenshot, or decline with
   a required reason); non-leads see only their own status/reason. ── */
const ENDORSEMENT_STYLES = {
  pending:  { bg: 'rgba(245,158,11,0.10)', color: '#d97706', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b', label: 'Not Reviewed' },
  endorsed: { bg: 'rgba(34,197,94,0.10)',  color: '#16a34a', border: 'rgba(34,197,94,0.25)',  dot: '#22c55e', label: 'Endorsed'     },
  declined: { bg: 'rgba(239,68,68,0.10)',  color: '#dc2626', border: 'rgba(239,68,68,0.25)', dot: '#ef4444', label: 'Declined'    },
};

function getValidLinkedinUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!/linkedin\.com/i.test(trimmed)) {
    if (/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
      return `https://www.linkedin.com/in/${trimmed}`;
    }
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function EndorsementCard({ postId, endorsement, isOwner, onDecided }) {
  const { member, status: initialStatus, reason: initialReason, screenshotUrl: initialScreenshotUrl } = endorsement;
  const [status, setStatus] = useState(initialStatus);
  const [reason, setReason] = useState(initialReason);
  const [screenshotUrl, setScreenshotUrl] = useState(initialScreenshotUrl);
  const [mode, setMode] = useState(null); // null | 'endorsing' | 'declining'
  const [declineReason, setDeclineReason] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const s = ENDORSEMENT_STYLES[status] || ENDORSEMENT_STYLES.pending;
  const linkedinUrl = getValidLinkedinUrl(member.socialLinks?.linkedin);

  const submitDecision = async (newStatus) => {
    if (newStatus === 'declined' && !declineReason.trim()) {
      toast.error('A reason is required when declining to endorse.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      if (newStatus === 'declined') fd.append('reason', declineReason.trim());
      if (newStatus === 'endorsed' && screenshotFile) fd.append('screenshot', screenshotFile);

      const { data } = await api.patch(`/workspace/${postId}/endorsements/${member._id}`, fd);
      setStatus(data.endorsement.status);
      setReason(data.endorsement.reason);
      setScreenshotUrl(data.endorsement.screenshotUrl);
      setMode(null);
      setScreenshotFile(null);
      setDeclineReason('');
      onDecided?.();
      toast.success(newStatus === 'endorsed' ? `Marked ${member.name} as endorsed.` : `Recorded decline for ${member.name}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/80 hover:border-accent/40 rounded-2xl p-5 shadow-sm transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Member Info */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <Avatar name={member.name} src={member.avatarUrl} size={48} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <span className="text-[16px] font-bold text-text-primary tracking-tight">{member.name}</span>
              {member.username && <span className="text-[13px] font-medium text-text-muted">@{member.username}</span>}
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                {s.label}
              </span>
            </div>

            {/* LinkedIn Redirect Link */}
            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] dark:text-[#3891e8] dark:bg-[#0A66C2]/20 dark:hover:bg-[#0A66C2]/30 border border-[#0A66C2]/25 transition-all no-underline shadow-2xs hover:shadow-xs mt-1"
                title={`Redirect to ${linkedinUrl}`}
              >
                <LinkedInIcon className="w-3.5 h-3.5 fill-current shrink-0 text-[#0A66C2] dark:text-[#3891e8]" />
                <span>View LinkedIn Profile</span>
                <ExternalLink size={12} className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </a>
            ) : member.socialLinks?.linkedin ? (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-surface-2 text-text-muted border border-border/40 mt-1">
                <LinkedInIcon className="w-3.5 h-3.5 fill-current opacity-40 shrink-0" />
                <span className="truncate max-w-[220px]">Invalid link: "{member.socialLinks.linkedin}"</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-surface-2/60 text-text-muted border border-border/40 mt-1">
                <LinkedInIcon className="w-3.5 h-3.5 fill-current opacity-40 shrink-0" />
                <span>No LinkedIn profile linked</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Lead */}
        {isOwner && status === 'pending' && !mode && (
          <div className="flex items-center gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto">
            <button
              onClick={() => setMode('endorsing')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Award size={15} />
              <span>Mark Endorsed</span>
            </button>
            <button
              onClick={() => setMode('declining')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <XCircle size={15} />
              <span>Decline to Endorse</span>
            </button>
          </div>
        )}

        {/* Change Decision Buttons for Lead */}
        {isOwner && status !== 'pending' && !mode && (
          <div className="flex items-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto justify-end">
            {status !== 'endorsed' && (
              <button
                onClick={() => setMode('endorsing')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Award size={13} />
                <span>Change to Endorsed</span>
              </button>
            )}
            {status !== 'declined' && (
              <button
                onClick={() => { setMode('declining'); setDeclineReason(''); }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <XCircle size={13} />
                <span>Change to Decline</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Endorsing Form (Proof Screenshot) */}
      {isOwner && mode === 'endorsing' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
              <FileImage size={14} className="text-emerald-500" />
              <span>Proof Screenshot <span className="font-normal text-text-muted">(optional but recommended)</span></span>
            </label>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)} />
          {screenshotFile ? (
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <Upload size={16} className="text-emerald-500" />
              <span className="text-[13px] font-medium flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-emerald-600 dark:text-emerald-400">{screenshotFile.name}</span>
              <button type="button" onClick={() => setScreenshotFile(null)} className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-3 transition-colors cursor-pointer"><X size={14} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full px-4 py-3.5 rounded-xl border-2 border-dashed border-border/80 hover:border-emerald-500/50 bg-surface-2/40 text-text-muted text-[13px] cursor-pointer flex items-center justify-center gap-2 transition-all duration-150 hover:text-emerald-600 dark:hover:text-emerald-400">
              <Upload size={16} /> Click or drop image to upload LinkedIn endorsement screenshot
            </button>
          )}
          <div className="flex gap-2 justify-end mt-1">
            <Button variant="ghost" size="sm" onClick={() => { setMode(null); setScreenshotFile(null); }}>Cancel</Button>
            <button
              onClick={() => submitDecision('endorsed')}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
              <span>Confirm Endorsement</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Declining Form (Reason Input) */}
      {isOwner && mode === 'declining' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
          <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1">
            <span>Reason for Declining</span> <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            placeholder="Explain briefly why endorsement is declined (e.g., non-responsiveness, incomplete deliverables)..."
            rows={3}
            className={fieldClasses}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => { setMode(null); setDeclineReason(''); }}>Cancel</Button>
            <button
              onClick={() => submitDecision('declined')}
              disabled={submitting || !declineReason.trim()}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              <span>Confirm Decline</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Proof / Reason Display Section */}
      {status !== 'pending' && !mode && (
        <div className="mt-3.5 pt-3 border-t border-border/40">
          {status === 'endorsed' && screenshotUrl && (
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/25 transition-colors no-underline"
            >
              <FileImage size={14} />
              <span>View Endorsement Proof Screenshot</span>
              <ExternalLink size={12} />
            </a>
          )}
          {status === 'declined' && reason && (
            <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-semibold block mb-0.5">Decline Reason:</span>
                <p className="leading-relaxed font-normal">"{reason}"</p>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function Endorsements({ postId, isOwner }) {
  const { data, isLoading: loading, refetch } = useWorkspaceEndorsements(postId);
  if (loading) return <Loader />;

  const endorsements = data?.endorsements ?? [];

  const total = endorsements.length;
  const endorsedCount = endorsements.filter(e => e.status === 'endorsed').length;
  const pendingCount = endorsements.filter(e => e.status === 'pending').length;
  const declinedCount = endorsements.filter(e => e.status === 'declined').length;

  if (total === 0) {
    return (
      <div className="text-center px-5 py-12 bg-surface-2/60 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
          <Award size={24} className="text-accent" />
        </div>
        <p className="text-base font-semibold text-text-primary mb-1 text-center">
          {isOwner ? 'No members to review yet' : "You're not eligible for review yet"}
        </p>
        <p className="text-sm text-text-muted text-center max-w-sm">
          {isOwner ? 'Accepted members will show up here for endorsement review.' : "Your project lead hasn't reviewed you yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {!isOwner && (
        <p className="text-xs text-text-muted mb-1">Your project lead's endorsement decision for you on this project.</p>
      )}
      {endorsements.map((e) => (
        <EndorsementCard key={e.member._id ?? e.member} postId={postId} endorsement={e} isOwner={isOwner} onDecided={refetch} />
      ))}
    </div>
  );
}

/* ── Discussion section — real-time via Socket.io ── */
function Discussion({ postId, leadId }) {
  const { user }    = useAuthStore();
  const connected   = useSocketStore((s) => s.connected);
  const rawMessages = useSocketStore((s) => s.projectMessages[postId]);
  const messages    = rawMessages ?? [];
  const seedProjectMessages   = useSocketStore((s) => s.seedProjectMessages);
  const appendProjectMessage = useSocketStore((s) => s.appendProjectMessage);

  const [loading,   setLoading]   = useState(rawMessages === undefined);
  const [text,      setText]      = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  /* Load history (skip if already cached from a previous visit to this tab)
     + join socket room — the actual live-message handling lives in
     socketStore (registered once, globally), so this only needs to manage
     room membership and the ephemeral typing indicator. */
  useEffect(() => {
    if (rawMessages === undefined) {
      api.get(`/workspace/${postId}/messages`)
        .then(r => seedProjectMessages(postId, r.data.messages))
        .finally(() => setLoading(false));
    }

    const socket = getSocket();
    if (!socket) return;

    socket.emit('project:join', { postId });

    const onTyping = ({ userId: uid, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(uid) : next.delete(uid);
        return next;
      });
    };

    socket.on('project:typing', onTyping);

    return () => {
      socket.emit('project:leave', { postId });
      socket.off('project:typing', onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  /* Auto-scroll on new message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* Send via socket (socket broadcasts to room + backend persists) */
  const send = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('project:message', { postId, text: text.trim() });
    } else {
      api.post(`/workspace/${postId}/messages`, { text: text.trim() })
        .then(r => appendProjectMessage(postId, r.data.message));
    }
    setText('');
    clearTimeout(typingTimer.current);
    socket?.emit('project:typing', { postId, isTyping: false });
  };

  /* Typing indicator */
  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('project:typing', { postId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('project:typing', { postId, isTyping: false });
    }, 1500);
  };

  if (loading) return <Loader />;

  const othersTyping = typingUsers.size > 0 && !typingUsers.has(user?._id);
  const lastMsg = messages[messages.length - 1];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] bg-card border border-border rounded-2xl overflow-hidden shadow-xs">

      {/* Discussion Header Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-dim flex items-center justify-center text-accent">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text-primary m-0">Project Discussion</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-dim text-accent">
                {messages.length} messages
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: othersTyping ? 'var(--accent)' : connected ? '#22c55e' : '#ef4444' }} />
              <p className="m-0 text-xs font-medium transition-colors" style={{ color: othersTyping ? 'var(--accent)' : 'var(--text-muted)' }}>
                {othersTyping ? 'Someone is typing...' : connected ? 'Live — messages appear instantly' : 'Connecting to live server…'}
              </p>
            </div>
          </div>
        </div>

        {/* Instagram-style Last Activity Snippet Pill */}
        {lastMsg && !othersTyping && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted bg-surface-1 px-3 py-1.5 rounded-full border border-border/60 shadow-2xs">
            <span className="font-semibold text-text-primary truncate max-w-[220px]">
              {lastMsg.author?.name ? `${lastMsg.author.name}: ` : ''}"{lastMsg.text}"
            </span>
            <span className="text-[10px] text-text-muted shrink-0">· {timeAgo(lastMsg.createdAt)}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3 bg-surface-0/40">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-12 text-text-muted text-sm gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent-dim flex items-center justify-center text-accent">
              <MessageSquare size={26} />
            </div>
            <div className="text-center max-w-xs">
              <p className="font-bold text-text-primary text-base m-0 mb-1">No messages yet</p>
              <p className="text-xs text-text-muted m-0">Start the project discussion with your team members!</p>
            </div>
          </div>
        ) : messages.map((msg, i) => {
          const isMe       = msg.author._id === user?._id || msg.author === user?._id || msg.author?.id === user?._id;
          const prevAuthor = messages[i - 1]?.author?._id ?? messages[i - 1]?.author;
          const thisAuthor = msg.author?._id ?? msg.author;
          const showMeta   = i === 0 || prevAuthor !== thisAuthor;
          const isLead     = leadId && String(thisAuthor) === leadId;

          return (
            <motion.div
              key={msg._id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
              className={`flex gap-2.5 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'} ${showMeta ? 'mt-2.5' : 'mt-0'}`}
            >
              {showMeta
                ? <Avatar name={msg.author?.name} src={msg.author?.avatarUrl} size={32} />
                : <div className="w-8 shrink-0" />}
              <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                {showMeta && !isMe && (
                  <span className="text-[11px] font-semibold ml-1 flex items-center gap-1" style={{ color: isLead ? CC : 'var(--text-muted)' }}>
                    {msg.author?.name || 'Contributor'}
                    {isLead && <Crown size={11} color={CC} />}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 text-sm leading-relaxed break-words shadow-xs ${
                    isMe
                      ? 'rounded-[18px_18px_4px_18px] bg-accent text-white'
                      : 'rounded-[18px_18px_18px_4px] bg-card border border-border/70 text-text-primary'
                  }`}
                  style={isMe ? { background: CC } : {}}
                >
                  {msg.text}
                </div>
                <span className={`text-[10px] mx-1 font-medium ${isMe ? 'text-text-muted text-right' : 'text-text-muted'}`}>
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {othersTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2 px-3.5 rounded-2xl bg-card border border-border/70 w-max text-xs text-text-muted shadow-xs ml-10"
            >
              <span>Someone is typing</span>
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                    style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-border bg-card flex items-center gap-3 shrink-0 shadow-sm">
        <input
          value={text} onChange={handleTyping}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={connected ? 'Type a message… (Enter to send)' : 'Reconnecting…'}
          aria-label="Discussion message"
          className="flex-1 min-h-[46px] px-4 rounded-xl border border-border bg-input text-text-primary text-sm outline-none transition-all duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <motion.button
          whileTap={{ scale: 0.94 }} onClick={send} disabled={!text.trim()}
          aria-label="Send message"
          className={`w-[46px] h-[46px] rounded-xl border-none flex items-center justify-center shrink-0 transition-all duration-150 ${
            text.trim()
              ? 'text-white shadow-md cursor-pointer hover:opacity-90 active:scale-95'
              : 'bg-surface-2 text-text-muted cursor-not-allowed opacity-60'
          }`}
          style={text.trim() ? { background: CC, boxShadow: `0 4px 12px ${CC}40` } : {}}
        >
          <Send size={18} />
        </motion.button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

/* ── Resources section ── */

function Resources({ postId, isOwner }) {
  const { data: resources = [], isLoading: loading } = useWorkspaceResources(postId);
  const resourcesQueryKey = ['workspace', postId, 'resources'];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ title: '', url: '', type: 'other', description: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const addResource = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/workspace/${postId}/resources`, form);
      queryClient.setQueryData(resourcesQueryKey, (prev = []) => [data.resource, ...prev]);
      setForm({ title: '', url: '', type: 'other', description: '' });
      setIsModalOpen(false);
    } finally { setSaving(false); }
  };

  const updateResource = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/workspace/${postId}/resources/${editingId}`, form);
      queryClient.setQueryData(resourcesQueryKey, (prev = []) => prev.map(r => r._id === editingId ? data.resource : r));
      setForm({ title: '', url: '', type: 'other', description: '' });
      setEditingId(null);
      setIsModalOpen(false);
    } finally { setSaving(false); }
  };

  const removeResource = async (id) => {
    if (!await confirm('Remove this resource?', { title: 'Remove resource', confirmLabel: 'Remove' })) return;
    await api.delete(`/workspace/${postId}/resources/${id}`);
    queryClient.setQueryData(resourcesQueryKey, (prev = []) => prev.filter(r => r._id !== id));
  };

  const openEditModal = (resource) => {
    setForm({ title: resource.title, url: resource.url, type: resource.type, description: resource.description || '' });
    setEditingId(resource._id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setForm({ title: '', url: '', type: 'other', description: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const filteredResources = resources.filter(r => {
    const matchesType = filter === 'all' || r.type === filter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const typeCounts = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});

  if (loading) return <Loader />;

  const resourceTypes = [
    { id: 'all', label: 'All', icon: Link2 },
    ...Object.keys(RESOURCE_ICONS).map(key => ({
      id: key,
      label: RESOURCE_ICONS[key].label,
      icon: RESOURCE_ICONS[key].icon,
      color: RESOURCE_ICONS[key].color,
    }))
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header with actions */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">
            {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </span>
          {resources.length > 0 && (
            <span className="text-xs text-text-muted">
              {resources.filter(r => r.type === 'github').length} GitHub · {resources.filter(r => r.type === 'figma').length} Figma
            </span>
          )}
        </div>
        {isOwner && (
          <Button size="sm" onClick={openAddModal}>
            <Plus size={16} /> Add Resource
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border bg-input text-sm text-text-primary outline-none transition-colors duration-150 focus:border-[#3a3d4a]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {resourceTypes.map(({ id, label, icon: Icon, color }) => {
            const isActive = filter === id;
            const count = id === 'all' ? resources.length : typeCounts[id] || 0;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-150"
                style={{
                  border: `1.5px solid ${isActive ? CC : 'var(--border)'}`,
                  background: isActive ? `${CC}14` : 'transparent',
                  color: isActive ? CC : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '400',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {Icon && <Icon size={12} color={isActive ? CC : color} />}
                {label}
                <span className="text-[10px] opacity-60 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center px-5 py-12 bg-surface-2 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center">
          <BookOpen size={48} className="mb-3 opacity-30 text-text-muted mx-auto block" />
          <p className="text-base font-semibold text-text-primary mb-1 text-center">
            {searchQuery || filter !== 'all' ? 'No matching resources' : 'No resources yet'}
          </p>
          <p className="text-sm text-text-muted text-center max-w-sm">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your GitHub repo, design file, or documentation to get started.'
            }
          </p>
          {isOwner && !searchQuery && filter === 'all' && (
            <Button size="sm" style={{ marginTop: '16px' }} onClick={openAddModal}>
              <Plus size={14} /> Add your first resource
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {filteredResources.map(r => {
            const { icon: Icon, color, label } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
            return (
              <div
                key={r._id}
                className="bg-card border border-card-border rounded-xl px-4.5 py-4 flex flex-col gap-2.5 transition-all duration-150 hover:shadow-md"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)'; }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: `${color}14` }}>
                    <Icon size={20} color={color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-text-primary">
                        {r.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0" style={{ background: `${color}12`, color }}>
                        {label}
                      </span>
                    </div>
                    {r.description && (
                      <p className="text-xs text-text-secondary mb-1 leading-snug">
                        {r.description}
                      </p>
                    )}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-text-muted no-underline flex items-center gap-1 break-all transition-colors duration-150"
                      onMouseEnter={(e) => (e.currentTarget.style.color = CC)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Link2 size={12} />
                      {r.url.replace(/(https?:\/\/)/, '').slice(0, 40)}
                      {r.url.length > 40 && '…'}
                    </a>
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="flex justify-between items-center pt-2 border-t border-divider">
                  <span className="text-[10px] text-text-muted">
                    Added {timeAgo(r.createdAt)}
                  </span>
                  <div className="flex gap-1">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-md border-none bg-surface-2 text-text-secondary text-[11px] cursor-pointer no-underline transition-all duration-150 hover:text-white"
                      onMouseEnter={(e) => { e.currentTarget.style.background = CC; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      Open →
                    </a>
                    {isOwner && (
                      <>
                        <button
                          onClick={() => openEditModal(r)}
                          className="px-2 py-1 rounded-md border border-border bg-transparent text-text-secondary text-[11px] cursor-pointer transition-colors duration-150 hover:border-[#3a3d4a] hover:text-[#3a3d4a]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeResource(r._id)}
                          className="px-2 py-1 rounded-md border border-error-border bg-transparent text-error text-[11px] cursor-pointer transition-colors duration-150 hover:bg-error-bg"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-300 p-0 sm:p-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-t-[28px] sm:rounded-[24px] max-w-[520px] w-full max-h-[92vh] sm:max-h-[88vh] overflow-y-auto scrollbar-none px-5 sm:px-7 pt-4 sm:pt-6 pb-6 border-t sm:border border-border/50 shadow-[0_-12px_40px_rgba(0,0,0,0.4)] sm:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_48px_-12px_rgba(0,0,0,0.3)]"
            >
              {/* Mobile handle indicator */}
              <div className="w-10 h-1 rounded-full bg-border/80 mx-auto mt-2 mb-3 sm:hidden shrink-0" />

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                  {editingId ? 'Edit Resource' : 'Add Resource'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 rounded-full border border-border/50 bg-surface-1 hover:bg-surface-2 flex items-center justify-center cursor-pointer text-text-secondary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    Resource Name <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Backend API Docs"
                    className={fieldClasses}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    URL <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                    placeholder="https://github.com/your-repo"
                    className={fieldClasses}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className={`${fieldClasses} cursor-pointer min-h-[42px]`}
                  >
                    <option value="github">GitHub</option>
                    <option value="figma">Figma</option>
                    <option value="docs">Docs</option>
                    <option value="deploy">Deploy</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
                    Description (optional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of this resource..."
                    rows={2}
                    className={`${fieldClasses} resize-y`}
                  />
                </div>

                <div className="flex gap-3 justify-end border-t border-border/40 pt-5 mt-2">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 sm:flex-initial">
                    Cancel
                  </Button>
                  <Button
                    onClick={editingId ? updateResource : addResource}
                    disabled={!form.title.trim() || !form.url.trim() || saving}
                    isLoading={saving}
                    className="flex-1 sm:flex-initial"
                  >
                    {saving ? 'Saving...' : (editingId ? 'Update Resource' : 'Add Resource')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Settings section (lead only) ── */
function Settings({ postId, isOwner, onTitleChange }) {
  const { data: overviewData, isLoading: loading } = useWorkspaceOverview(isOwner ? postId : null);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    title: '', projectName: '', body: '', domain: 'webdev',
    techStack: [], rolesNeeded: [], membersNeeded: 1,
  });
  const [formReady, setFormReady] = useState(false);
  const [techInput, setTechInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  useEffect(() => {
    if (!overviewData || formReady) return;
    const post = overviewData.post;
    setForm({
      title:         post?.title || '',
      projectName:   post?.projectName || '',
      body:          post?.body || '',
      domain:        post?.domain || 'webdev',
      techStack:     post?.techStack || [],
      rolesNeeded:   post?.rolesNeeded || [],
      membersNeeded: post?.membersNeeded ?? 1,
    });
    setFormReady(true);
  }, [overviewData, formReady]);

  if (!isOwner) return null;
  if (loading || !formReady) return <Loader />;

  const addTag = (key, value, setInput) => {
    const v = value.trim();
    if (v && !form[key].includes(v)) setForm(f => ({ ...f, [key]: [...f[key], v] }));
    setInput('');
  };
  const removeTag = (key, val) => setForm(f => ({ ...f, [key]: f[key].filter(t => t !== val) }));

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const { data } = await api.patch(`/workspace/${postId}/settings`, form);
      onTitleChange?.(data.post.projectName || data.post.title);
      invalidateWorkspace(postId);
      toast.success('Workspace settings saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const tagPill = (key, value) => (
    <span key={value} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-xs font-medium" style={{ background: CC }}>
      {value}
      <button type="button" onClick={() => removeTag(key, value)} aria-label={`Remove ${value}`}
        className="bg-none border-none cursor-pointer text-white/80 flex p-0 leading-none">
        <X size={12} />
      </button>
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-5 items-stretch">
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4.5">

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Project Name</label>
          <input type="text" value={form.projectName} onChange={(e) => setForm(f => ({ ...f, projectName: e.target.value }))}
            placeholder="e.g., E-commerce Platform" className={fieldClasses} />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Title <span className="text-[#ef4444]">*</span></label>
          <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Workspace title" className={fieldClasses} />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Description</label>
          <textarea value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="What is this project about?" rows={4} className={`${fieldClasses} resize-y`} />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Domain</label>
          <select value={form.domain} onChange={(e) => setForm(f => ({ ...f, domain: e.target.value }))} className={`${fieldClasses} cursor-pointer`}>
            {DOMAINS.filter(d => d.value !== 'all').map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Members Needed</label>
          <input type="number" min={0} max={50} value={form.membersNeeded}
            onChange={(e) => setForm(f => ({ ...f, membersNeeded: e.target.value }))}
            className={fieldClasses} />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Tech Stack</label>
          {form.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.techStack.map(t => tagPill('techStack', t))}
            </div>
          )}
          <input type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('techStack', techInput, setTechInput); } }}
            placeholder="Type a tech and press Enter (e.g. React, Node.js)" className={fieldClasses}
            onBlur={() => addTag('techStack', techInput, setTechInput)} />
        </div>

        <div>
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">Roles Needed</label>
          {form.rolesNeeded.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.rolesNeeded.map(r => tagPill('rolesNeeded', r))}
            </div>
          )}
          <input type="text" value={roleInput} onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag('rolesNeeded', roleInput, setRoleInput); } }}
            placeholder="Type a role and press Enter (e.g. Frontend Dev)" className={fieldClasses}
            onBlur={() => addTag('rolesNeeded', roleInput, setRoleInput)} />
        </div>

        <div className="flex justify-end border-t border-border pt-5">
          <Button onClick={save} isLoading={saving} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3.5 h-full">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Preview</p>

        <div>
          <p className="text-[15px] font-bold text-text-primary leading-tight break-word">
            {form.projectName || form.title || 'Untitled project'}
          </p>
          {form.title && form.projectName && (
            <p className="text-xs text-text-muted mt-0.5">{form.title}</p>
          )}
        </div>

        {form.body && (
          <p className="text-[13px] text-text-secondary leading-snug">{form.body}</p>
        )}

        <span
          className="self-start inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-bold"
          style={{
            background: `${DOMAINS.find(d => d.value === form.domain)?.color ?? CC}18`,
            color: DOMAINS.find(d => d.value === form.domain)?.color ?? CC,
          }}
        >
          {DOMAINS.find(d => d.value === form.domain)?.label ?? form.domain}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <Users size={13} /> {form.membersNeeded || 0} member{Number(form.membersNeeded) === 1 ? '' : 's'} needed
        </div>

        {form.techStack.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-text-muted mb-1.5">Tech Stack</p>
            <div className="flex flex-wrap gap-[5px]">
              {form.techStack.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary text-[11px]">{t}</span>
              ))}
            </div>
          </div>
        )}

        {form.rolesNeeded.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-text-muted mb-1.5">Roles Needed</p>
            <div className="flex flex-wrap gap-[5px]">
              {form.rolesNeeded.map(r => (
                <span key={r} className="px-2 py-0.5 rounded-full bg-surface-2 text-text-secondary text-[11px]">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sidebar nav item ── */
const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',       icon: CheckSquare     },
  { id: 'members',     label: 'Members',     icon: Users           },
  { id: 'endorsements', label: 'Endorsements', icon: Award         },
  { id: 'discussion',  label: 'Discussion',  icon: MessageSquare   },
  { id: 'resources',   label: 'Resources',   icon: BookOpen        },
  { id: 'settings',    label: 'Settings',    icon: SettingsIcon,   ownerOnly: true },
];

/* ── Task board (inline) ── */
const STATUSES = [
  { id: 'todo',        label: 'To Do',       color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#d97706' },
  { id: 'in_review',   label: 'In Review',   color: '#0891b2' },
  { id: 'done',        label: 'Done',        color: '#16a34a' },
];
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

// ── Task board with professional add modal ──
function Tasks({ postId, isOwner }) {
  const { data: queryTasks, isLoading: loading } = useWorkspaceTasks(postId);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("todo");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!queryTasks) return;
    setTasks(queryTasks);
    setSelected(prev => queryTasks.find(t => t._id === prev?._id) ?? queryTasks[0] ?? null);
  }, [queryTasks]);

  useEffect(() => {
    setShowReviewForm(false);
    setReviewNote('');
  }, [selected?._id]);

  const patch = async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    if (selected?._id === taskId) setSelected(data.task);
    invalidateWorkspace(postId);
  };

  const addTask = async (taskData) => {
    await api.post(`/posts/${postId}/tasks`, taskData);
    invalidateWorkspace(postId);
  };

  const deleteTask = async (id) => {
    if (!await confirm('Delete this task?', { title: 'Delete task', confirmLabel: 'Delete' })) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    if (selected?._id === id) setSelected(null);
    invalidateWorkspace(postId);
  };

  const toggleChecklist = async (idx) => {
    const updated = selected.checklist.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item);
    await patch(selected._id, { checklist: updated });
  };

  const addChecklistItem = async () => {
    const updated = [...(selected.checklist ?? []), { text: 'New item', completed: false }];
    await patch(selected._id, { checklist: updated });
  };

  const submitForReview = async () => {
    if (!reviewNote.trim()) {
      toast.error('Describe what you completed before submitting.');
      return;
    }
    setSubmittingReview(true);
    try {
      await patch(selected._id, { status: 'in_review', completionNote: reviewNote.trim() });
      setShowReviewForm(false);
      setReviewNote('');
      toast.success('Submitted for review');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit for review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const approveTask = async () => {
    try {
      await patch(selected._id, { status: 'done' });
      toast.success('Task approved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve task');
    }
  };

  const requestChanges = async () => {
    try {
      await patch(selected._id, { status: 'in_progress' });
      toast('Sent back for changes', { icon: <RotateCcw size={16} color="#d97706" /> });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col gap-4">
      {/* Task Board Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-text-muted">
            {tasks.filter(t => t.status === 'done').length} completed
          </span>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => { setModalStatus('todo'); setIsModalOpen(true); }}>
            <Plus size={16} /> New Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full items-start pb-4">
        {STATUSES.map(({ id: status, label, color }) => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className="w-full bg-surface-2 rounded-xl p-3.5 flex flex-col gap-2.5 border border-border/70 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[13px] font-bold text-text-primary">{label}</span>
                  <span className="text-[10px] text-text-muted bg-surface-3 px-1.5 rounded-lg">
                    {colTasks.length}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => { setModalStatus(status); setIsModalOpen(true); }}
                    className="bg-none border-none cursor-pointer text-text-muted flex items-center p-1 rounded transition-colors duration-150 hover:bg-surface-3"
                  >
                    <Plus size={16} />
                  </button>
                )}
              </div>

              {/* Task cards */}
              {colTasks.map(task => (
                <div
                  key={task._id}
                  onClick={() => setSelected(task)}
                  className="bg-card rounded-lg p-3 cursor-pointer transition-all duration-150"
                  style={{
                    border: selected?._id === task._id ? `2px solid ${CC}` : '1px solid var(--card-border)',
                    boxShadow: selected?._id === task._id ? `0 0 0 3px ${CC}15` : 'none',
                  }}
                  onMouseEnter={(e) => { if (selected?._id !== task._id) e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                  onMouseLeave={(e) => { if (selected?._id !== task._id) e.currentTarget.style.borderColor = 'var(--card-border)'; }}
                >
                  <p className="text-[13px] font-semibold text-text-primary mb-1.5 leading-[1.4]">
                    {task.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded" style={{ background: `${PRIORITY_COLORS[task.priority] || '#6b7280'}15`, color: PRIORITY_COLORS[task.priority] || '#6b7280' }}>
                      {task.priority || 'medium'}
                    </span>
                    {task.checklist?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                        <CheckSquare size={10} /> {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                      </span>
                    )}
                    {task.assignees?.length > 0 && (
                      <div className="flex">
                        {task.assignees.slice(0, 2).map((a, i) => (
                          <Avatar key={i} name={a} size={18} />
                        ))}
                        {task.assignees.length > 2 && (
                          <span className="text-[9px] text-text-muted ml-0.5">
                            +{task.assignees.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                      <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}

              {isOwner && (
                <button
                  onClick={() => { setModalStatus(status); setIsModalOpen(true); }}
                  className="w-full p-1.5 rounded-lg border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-colors duration-150 hover:border-[#3a3d4a] hover:text-[#3a3d4a]"
                >
                  <Plus size={11} /> Add task
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="mt-4 bg-card border border-card-border rounded-xl p-5 flex flex-col gap-4 max-h-[400px] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isOwner ? (
                <input
                  value={selected.title}
                  onChange={e => setSelected(s => ({ ...s, title: e.target.value }))}
                  onBlur={() => patch(selected._id, { title: selected.title })}
                  className="text-base font-bold text-text-primary bg-transparent border-none outline-none border-b-2 border-border pb-1.5 w-full"
                />
              ) : (
                <p className="text-base font-bold text-text-primary m-0">{selected.title}</p>
              )}
              {selected.description && (
                <p className="text-[13px] text-text-secondary mt-2">{selected.description}</p>
              )}
            </div>
            <span
              className="px-2.5 py-0.5 rounded-xl text-[10px] font-semibold shrink-0"
              style={{ background: `${STATUSES.find(s => s.id === selected.status)?.color ?? '#6b7280'}1f`, color: STATUSES.find(s => s.id === selected.status)?.color ?? '#6b7280' }}
            >
              {STATUSES.find(s => s.id === selected.status)?.label || selected.status}
            </span>
          </div>

          <div className="flex gap-4 flex-wrap">
            {/* Status buttons */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Status</label>
              <div className="flex gap-1">
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => isOwner && patch(selected._id, { status: s.id })}
                    title={!isOwner ? 'Only the lead can set this directly — use Submit for Review below' : undefined}
                    className={`px-2.5 py-1 rounded-xl text-[10px] transition-all duration-150 ${isOwner ? 'cursor-pointer' : 'cursor-not-allowed'} ${selected.status === s.id ? 'font-bold' : 'font-normal'}`}
                    style={{
                      border: `1.5px solid ${selected.status === s.id ? s.color : 'var(--border)'}`,
                      background: selected.status === s.id ? `${s.color}14` : 'transparent',
                      color: selected.status === s.id ? s.color : 'var(--text-secondary)',
                      opacity: !isOwner && selected.status !== s.id ? 0.5 : 1,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Priority</label>
              <div className="flex gap-1">
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    onClick={() => isOwner && patch(selected._id, { priority: p })}
                    className={`px-2.5 py-1 rounded-xl text-[10px] capitalize transition-all duration-150 ${isOwner ? 'cursor-pointer' : 'cursor-default'} ${selected.priority === p ? 'font-bold' : 'font-normal'}`}
                    style={{
                      border: `1.5px solid ${selected.priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`,
                      background: selected.priority === p ? `${PRIORITY_COLORS[p]}14` : 'transparent',
                      color: selected.priority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)',
                      opacity: !isOwner && selected.priority !== p ? 0.5 : 1,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Due Date</label>
              {isOwner ? (
                <input
                  type="date"
                  value={selected.dueDate?.slice(0, 10) ?? ''}
                  onChange={e => patch(selected._id, { dueDate: e.target.value || null })}
                  className="px-2 py-1 rounded-md border border-border bg-input text-[11px] text-text-primary outline-none"
                />
              ) : selected.dueDate ? (
                <span className="text-[11px] text-text-muted">
                  {new Date(selected.dueDate).toLocaleDateString()}
                </span>
              ) : null}
            </div>
          </div>

          {/* Review workflow */}
          {!isOwner && selected.status !== 'done' && (
            <div className="border-t border-border pt-3">
              {selected.status === 'in_review' ? (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[rgba(8,145,178,0.08)] border border-[rgba(8,145,178,0.2)]">
                  <ClipboardCheck size={15} color={CC} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold mb-1" style={{ color: CC }}>Waiting for lead review</p>
                    {selected.completionNote && (
                      <p className="text-xs text-text-secondary leading-snug">{selected.completionNote}</p>
                    )}
                  </div>
                </div>
              ) : showReviewForm ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-text-muted uppercase">
                    What did you complete?
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    placeholder="Describe what you did, so the lead can review it…"
                    rows={3}
                    className="px-3 py-2.5 rounded-lg border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none resize-y font-[inherit] leading-snug transition-colors duration-150 focus:border-[#3a3d4a]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={submitForReview} disabled={!reviewNote.trim() || submittingReview} isLoading={submittingReview}>
                      {!submittingReview && <ClipboardCheck size={13} />}
                      Submit for review
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setShowReviewForm(false); setReviewNote(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" onClick={() => setShowReviewForm(true)}>
                  <ClipboardCheck size={14} /> Mark complete for review
                </Button>
              )}
            </div>
          )}

          {selected.status === 'done' && selected.completionNote && (
            <div className="px-3 py-2.5 rounded-lg bg-[rgba(22,163,74,0.08)] border border-[rgba(22,163,74,0.2)]">
              <p className="text-xs font-bold text-[#16a34a] mb-1 flex items-center gap-1.5">
                <CheckCircle size={13} /> Completed by {selected.completedBy?.name || 'a contributor'}
              </p>
              <p className="text-xs text-text-secondary leading-snug">{selected.completionNote}</p>
            </div>
          )}

          {isOwner && selected.status === 'in_review' && (
            <div className="border-t border-border pt-3">
              <div className="px-3 py-2.5 rounded-lg bg-[rgba(8,145,178,0.08)] border border-[rgba(8,145,178,0.2)] mb-2.5">
                <p className="text-xs font-bold mb-1" style={{ color: CC }}>
                  Submitted by {selected.completedBy?.name || 'a contributor'} for review
                </p>
                {selected.completionNote && (
                  <p className="text-xs text-text-secondary leading-snug">{selected.completionNote}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={approveTask}
                  className="flex items-center gap-1.5 min-h-9 px-4 rounded-lg border-none bg-[#16a34a] text-white text-xs font-bold cursor-pointer"
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={requestChanges}
                  className="flex items-center gap-1.5 min-h-9 px-4 rounded-lg border-[1.5px] border-border bg-transparent text-text-secondary text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw size={13} /> Request changes
                </button>
              </div>
            </div>
          )}

          {/* Checklist */}
          {selected.checklist?.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1.5">
                Checklist ({selected.checklist.filter(i => i.completed).length}/{selected.checklist.length})
              </label>
              <div className="flex flex-col gap-1">
                {selected.checklist.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 ${isOwner ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isOwner && toggleChecklist(idx)}
                  >
                    {item.completed ? <CheckCircle size={14} color="#16a34a" /> : <Circle size={14} color="var(--text-muted)" />}
                    <span className={`text-xs ${item.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignees */}
          {selected.assignees?.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase block mb-1">Assignees</label>
              <div className="flex gap-1 flex-wrap">
                {selected.assignees.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-xl text-[11px] flex items-center gap-1" style={{ background: 'rgba(8,145,178,0.1)', color: CC }}>
                    {a}
                    {isOwner && (
                      <button
                        onClick={() => patch(selected._id, { assignees: selected.assignees.filter((_, idx) => idx !== i) })}
                        className="bg-none border-none cursor-pointer p-0 text-xs"
                        style={{ color: CC }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner-only actions */}
          {isOwner && (
            <div className="flex flex-wrap gap-2 border-t border-border pt-3">
              <button
                onClick={addChecklistItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-dashed border-border bg-transparent text-text-muted text-[11px] cursor-pointer transition-colors duration-150 hover:border-[#3a3d4a] hover:text-[#3a3d4a]"
              >
                <Plus size={12} /> Add checklist item
              </button>
              <button
                onClick={() => deleteTask(selected._id)}
                className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md border-[1.5px] border-error-border bg-error-bg text-error text-[11px] cursor-pointer"
              >
                <Trash2 size={12} /> Delete task
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
        defaultStatus={modalStatus}
      />
    </div>
  );
}

/* ── Add Task Modal ── */
function AddTaskModal({ isOpen, onClose, onAdd, defaultStatus }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState(defaultStatus || "todo");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [checklistItems, setChecklistItems] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [assigneeInput, setAssigneeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStatus(defaultStatus || "todo");
      setDueDate("");
      setAssignees([]);
      setChecklistItems([]);
      setNewChecklistItem("");
      setTags([]);
      setNewTag("");
      setAssigneeInput("");
      setIsSubmitting(false);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultStatus]);

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklistItems([...checklistItems, { id: Date.now().toString(), text: newChecklistItem.trim(), completed: false }]);
    setNewChecklistItem("");
  };

  const handleRemoveChecklistItem = (id) => {
    setChecklistItems(checklistItems.filter(item => item.id !== id));
  };

  const handleToggleChecklistItem = (id) => {
    setChecklistItems(
      checklistItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setTags([...tags, newTag.trim()]);
    setNewTag("");
  };

  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddAssignee = (name) => {
    if (!name.trim()) return;
    if (assignees.some(a => a.toLowerCase() === name.toLowerCase())) return;
    setAssignees([...assignees, name.trim()]);
    setAssigneeInput("");
  };

  const handleRemoveAssignee = (name) => {
    setAssignees(assignees.filter(a => a !== name));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null,
        assignees,
        checklist: checklistItems.map(item => ({
          text: item.text,
          completed: item.completed,
        })),
        tags,
      };
      await onAdd(taskData);
      onClose();
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center z-9999 p-0 sm:p-5"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-t-[28px] sm:rounded-2xl max-w-[580px] w-full max-h-[92vh] sm:max-h-[88vh] overflow-y-auto scrollbar-none px-5 sm:px-8 pt-3 sm:pt-7 pb-6 border-t sm:border border-border shadow-[0_-12px_40px_rgba(0,0,0,0.4)] sm:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle indicator */}
        <div className="w-10 h-1 rounded-full bg-border/80 mx-auto mt-2 mb-3 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex justify-between items-center mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">
            Create New Task
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-none border-none text-text-muted cursor-pointer w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Title */}
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
            Task Title <span className="text-[#ef4444]">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            className={fieldClasses}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task in detail..."
            rows={3}
            className={`${fieldClasses} resize-y`}
          />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
              Priority
            </label>
            <div className="flex gap-1.5">
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-2.5 py-2 sm:py-1.5 rounded-lg text-xs capitalize cursor-pointer transition-all duration-150 ${priority === p ? 'font-bold' : 'font-medium'}`}
                  style={{
                    border: `1.5px solid ${priority === p ? PRIORITY_COLORS[p] : "var(--border)"}`,
                    background: priority === p ? `${PRIORITY_COLORS[p]}18` : "transparent",
                    color: priority === p ? PRIORITY_COLORS[p] : "var(--text-secondary)",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none cursor-pointer min-h-[40px]"
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Assignees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none min-h-[40px]"
            />
          </div>

          <div>
            <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
              Assignees
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {assignees.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "rgba(8,145,178,0.12)", color: CC }}
                >
                  {name}
                  <button
                    onClick={() => handleRemoveAssignee(name)}
                    className="bg-none border-none cursor-pointer px-0.5 text-sm"
                    style={{ color: CC }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAssignee(assigneeInput);
                  }
                }}
                placeholder="Add assignee..."
                className="flex-1 px-2.5 py-1.5 rounded-md border-[1.5px] border-border bg-input text-xs text-text-primary outline-none"
              />
              <Button size="sm" onClick={() => handleAddAssignee(assigneeInput)} className="shrink-0">
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="mb-4">
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
            Checklist
          </label>
          <div className="flex flex-col gap-1.5 mb-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className="bg-none border-none cursor-pointer p-0"
                  style={{ color: item.completed ? "#16a34a" : "var(--text-muted)" }}
                >
                  {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span className={`text-[13px] flex-1 ${item.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                  {item.text}
                </span>
                <button
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="bg-none border-none cursor-pointer text-text-muted p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Add checklist item..."
              className="flex-1 px-2.5 py-1.5 rounded-md border-[1.5px] border-border bg-input text-xs text-text-primary outline-none"
            />
            <button
              onClick={handleAddChecklistItem}
              className="px-3 py-1.5 rounded-md border-none bg-(image:--btn-grad) text-white shadow-btn text-xs font-semibold cursor-pointer shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-5">
          <label className="text-[13px] font-semibold text-text-secondary block mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-xl text-[11px] font-medium"
                style={{ background: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="bg-none border-none cursor-pointer px-0.5 text-xs"
                  style={{ color: "#8b5cf6" }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="flex-1 px-2.5 py-1.5 rounded-md border-[1.5px] border-border bg-input text-xs text-text-primary outline-none"
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-1.5 rounded-md border-none bg-[#8b5cf6] text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end border-t border-border pt-5">
          <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-initial">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting} isLoading={isSubmitting} className="flex-1 sm:flex-initial">
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main workspace page ── */
export default function WorkspacePage() {
  const { id: postId } = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuthStore();
  const [section,   setSection]   = useState('overview');
  const [titleOverride, setTitleOverride] = useState(null);

  const { data: overviewData, isFetched: roleReady } = useWorkspaceOverview(postId);
  const post = overviewData?.post;
  const authorId = post?.author?._id ?? post?.author;
  const isOwner = !!post && String(authorId) === String(user?._id);
  const leadId  = authorId ? String(authorId) : null;
  const postTitle = titleOverride ?? (post ? (post.projectName || post.title || 'Workspace') : 'Workspace');
  const setPostTitle = setTitleOverride;

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <Overview   postId={postId} isOwner={isOwner} onEdit={() => setSection('settings')} />;
      case 'tasks':      return <Tasks      postId={postId} isOwner={isOwner} />;
      case 'members':    return <Members    postId={postId} isOwner={isOwner} />;
      case 'endorsements': return <Endorsements postId={postId} isOwner={isOwner} />;
      case 'discussion': return <Discussion postId={postId} isOwner={isOwner} leadId={leadId} />;
      case 'resources':  return <Resources  postId={postId} isOwner={isOwner} />;
      case 'settings':   return <Settings   postId={postId} isOwner={isOwner} onTitleChange={setPostTitle} />;
      default: return null;
    }
  };

  // Global Escape key listener to close current workspace tab
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an active input, textarea, or select field
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (e.key === 'Escape' && !isTyping) {
        if (section !== 'overview') {
          setSection('overview');
        } else {
          navigate('/collab');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [section, navigate]);

  const visibleNavItems = NAV_ITEMS.filter(item => !item.ownerOnly || isOwner);

  return (
    <div className="min-h-svh bg-surface-0 flex flex-col">
      <Navbar />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex w-55 shrink-0 bg-card border-r border-border p-3 flex-col gap-1 sticky top-15 h-[calc(100svh-60px)] overflow-y-auto">
          {/* Back */}
          <button
            onClick={() => navigate('/collab')}
            className="flex items-center gap-1.5 p-2.5 min-h-10 box-border rounded-lg border-none bg-transparent text-text-muted text-[13px] cursor-pointer mb-2 text-left transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
          >
            <ArrowLeft size={13} /> Collab Hub
          </button>

          {/* Project name + role */}
          <div className="px-2.5 pt-2.5 pb-3.5 border-b border-divider mb-2">
            <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: CC }}>Project</p>
            <p className="text-sm font-bold text-text-primary leading-tight mb-2">{postTitle}</p>
            {roleReady && (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-bold"
                style={{ background: isOwner ? `${CC}18` : 'rgba(34,197,94,0.1)', color: isOwner ? CC : '#16a34a', border: `1px solid ${isOwner ? CC + '35' : 'rgba(34,197,94,0.25)'}` }}
              >
                {isOwner ? <Crown size={11} /> : <User size={11} />} {isOwner ? 'Owner' : 'Member'}
              </span>
            )}
          </div>

          {/* Nav items */}
          {visibleNavItems.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <motion.button
                key={id} onClick={() => setSection(id)} whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2.5 p-2.5 min-h-11 box-border rounded-[9px] border-none cursor-pointer text-left w-full text-sm transition-colors duration-120 ${active ? 'font-bold' : 'font-medium'}`}
                style={{ background: active ? `${CC}14` : 'transparent', color: active ? CC : 'var(--text-secondary)' }}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
                {active && <motion.div layoutId="sidebar-indicator" className="absolute left-0 w-[3px] h-7 rounded-[0_2px_2px_0]" style={{ background: CC }} />}
              </motion.button>
            );
          })}
        </aside>

        {/* Tab bar (mobile/tablet fixed bottom bar for 1-thumb touch access) */}
        <nav className="flex lg:hidden fixed bottom-0 left-0 right-0 z-100 bg-card/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-4px_24px_rgba(0,0,0,0.18)] px-2 pt-2 pb-5 sm:pb-2.5 overflow-x-auto scrollbar-none gap-1 items-center justify-around">
          {visibleNavItems.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id} onClick={() => setSection(id)}
                className={`flex flex-col items-center justify-center gap-0.5 shrink-0 px-2.5 py-1.5 min-w-[58px] rounded-xl border-none cursor-pointer whitespace-nowrap text-[10px] sm:text-xs transition-all duration-150 active:scale-95 ${active ? 'font-bold bg-accent-bg text-accent border border-accent-border shadow-2xs' : 'font-medium bg-surface-1 text-text-secondary hover:text-text-primary'}`}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6 overflow-x-auto min-w-0">
          <div style={{ maxWidth: section === 'tasks' ? 'none' : '1100px' }}>
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-text-primary m-0 tracking-[-0.3px]">
                  {NAV_ITEMS.find(n => n.id === section)?.label}
                </h1>
                {section !== 'overview' && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted font-medium bg-surface-1 px-2.5 py-1 rounded-full border border-border/60">
                    Press <kbd className="text-[10px] font-mono font-bold text-text-primary px-1.5 py-0.5 rounded bg-surface-2 border border-border shadow-2xs">ESC</kbd> to close tab
                  </span>
                )}
              </div>
              {section !== 'overview' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSection('overview')}
                  title="Close tab (Esc)"
                  aria-label="Close tab"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-1 hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary cursor-pointer text-xs font-semibold transition-all shadow-xs"
                >
                  <X size={14} /> Close Tab
                </motion.button>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
