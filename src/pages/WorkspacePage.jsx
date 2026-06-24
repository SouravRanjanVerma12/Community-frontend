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
  ClipboardCheck, RotateCcw,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import api from '../api/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import { getSocket, useSocketStore } from '../stores/socketStore';

/* ── shared helpers ── */
const CC = '#0891b2';

function Avatar({ name, src, size = 32 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '700', border: '2px solid var(--border)', flexShrink: 0 }}>{initials}</div>;
}

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso)) / 1000;
  if (d < 60) return 'just now';
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

const RESOURCE_ICONS = {
  github: { icon: Code,     color: '#1a1a1a', label: 'GitHub'  },
  figma:  { icon: Palette,  color: '#a259ff', label: 'Figma'   },
  docs:   { icon: FileText, color: '#2563eb', label: 'Docs'    },
  deploy: { icon: Globe,    color: '#059669', label: 'Deploy'  },
  other:  { icon: Link2,    color: '#6b7280', label: 'Link'    },
};

/* ── Overview section ── */

function Overview({ postId, isOwner }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get(`/workspace/${postId}/overview`),
      api.get(`/workspace/${postId}/activity?limit=5`).catch(() => ({ data: { activities: [] } }))
    ]).then(([overviewRes, activityRes]) => {
      setData(overviewRes.data);
      setRecentActivity(activityRes.data?.activities || []);
    }).finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <Loader />;
  if (!data) return null;

  const { post, taskStats, memberCount, msgCount, recentResources } = data;
  const totalTasks = taskStats.todo + taskStats.in_progress + taskStats.done;
  const progress = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;
  const isComplete = progress === 100 && totalTasks > 0;

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Project Header Card */}
      <div style={{
        background: 'var(--card-bg)',
        border: `1px solid ${isComplete ? '#16a34a' : CC}28`,
        borderRadius: '16px',
        padding: '24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Status ribbon */}
        {isComplete && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: -28,
            padding: '4px 40px',
            background: '#16a34a',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            transform: 'rotate(45deg)',
            letterSpacing: '1px',
          }}>
            Completed
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            {post.projectName && (
              <p style={{ fontSize: '12px', fontWeight: '700', color: CC, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {post.projectName}
              </p>
            )}
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.3px' }}>
              {post.title}
            </h2>
            {post.body && (
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '12px', maxWidth: '600px' }}>
                {post.body}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {post.techStack?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.techStack.map(t => (
                    <span key={t} style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      background: 'var(--surface-2)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      fontFamily: 'var(--mono)',
                      border: '1px solid var(--border)',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                background: isOwner ? `${CC}14` : 'rgba(107,114,128,0.1)',
                color: isOwner ? CC : 'var(--text-muted)',
                border: `1px solid ${isOwner ? CC + '35' : 'var(--border)'}`,
              }}>
                {isOwner ? <Crown size={11} /> : <User size={11} />} {isOwner ? 'Owner' : 'Member'}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '600',
                background: isComplete ? 'rgba(22,163,74,0.12)' : 'rgba(8,145,178,0.12)',
                color: isComplete ? '#16a34a' : CC,
                border: `1px solid ${isComplete ? 'rgba(22,163,74,0.2)' : CC + '35'}`,
              }}>
                {isComplete ? <CheckCircle size={11} /> : <Clock size={11} />} {isComplete ? 'Complete' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Quick actions */}
          {isOwner && (
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = CC; e.currentTarget.style.color = CC; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Edit size={14} /> Edit
              </button>
              <button
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = CC; e.currentTarget.style.color = CC; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '14px',
      }}>
        {[
          { icon: Users, label: 'Members', value: memberCount, color: CC, suffix: '' },
          { icon: CheckSquare, label: 'Total Tasks', value: totalTasks, color: '#d97706', suffix: '' },
          { icon: CheckCircle, label: 'Completed', value: taskStats.done, color: '#16a34a', suffix: `of ${totalTasks}` },
          { icon: MessageSquare, label: 'Messages', value: msgCount, color: '#8b5cf6', suffix: '' },
          { icon: Clock, label: 'Progress', value: `${progress}%`, color: progress === 100 ? '#16a34a' : CC, suffix: '' },
        ].map(({ icon: Icon, label, value, color, suffix }) => (
          <div key={label} style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = color + '40';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--card-border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {value}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
              {suffix && <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{suffix}</span>}
            </div>
            {label === 'Progress' && (
              <div style={{
                marginTop: '4px',
                height: '4px',
                borderRadius: '2px',
                background: 'var(--surface-3)',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: progress === 100 ? '#16a34a' : CC,
                    borderRadius: '2px',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout: Progress + Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Task Progress Breakdown */}
        {totalTasks > 0 && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '20px 22px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Task Breakdown
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {taskStats.done} / {totalTasks} done
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'To Do', value: taskStats.todo, color: '#6b7280', icon: Circle },
                { label: 'In Progress', value: taskStats.in_progress, color: '#d97706', icon: Clock },
                { label: 'Done', value: taskStats.done, color: '#16a34a', icon: CheckCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={14} color={color} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', minWidth: '80px' }}>
                    {label}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--surface-3)',
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalTasks > 0 ? `${(value / totalTasks) * 100}%` : 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: color,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', minWidth: '30px', textAlign: 'right' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '20px 22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Recent Activity
            </span>
            <span style={{ fontSize: '11px', color: CC, cursor: 'pointer' }}>View all →</span>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px' }}>No recent activity yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivity.map((act, i) => (
                <div
                  key={act._id || i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 0',
                    borderBottom: i < recentActivity.length - 1 ? '1px solid var(--divider)' : 'none',
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: act.type === 'task_created' ? '#8b5cf6' :
                              act.type === 'task_completed' ? '#16a34a' :
                              act.type === 'member_joined' ? '#0891b2' : '#6b7280',
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1 }}>
                    {act.text || act.message}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>
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
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '18px 22px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
              <Paperclip size={14} /> Recent Resources
            </span>
            <span style={{ fontSize: '11px', color: CC, cursor: 'pointer' }}>View all →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recentResources.slice(0, 4).map((r, i) => {
              const { icon: Icon, color } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
              return (
                <a
                  key={r._id || i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    borderBottom: i < Math.min(recentResources.length, 4) - 1 ? '1px solid var(--divider)' : 'none',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = CC;
                    e.currentTarget.style.paddingLeft = '4px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  <Icon size={15} color={color} />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '500', flex: 1 }}>
                    {r.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Contributor');
  const [inviting, setInviting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [sortBy, setSortBy] = useState('joinedAt'); // joinedAt, name, role

  useEffect(() => {
    api.get(`/workspace/${postId}/members`).then(r => setMembers(r.data.members)).finally(() => setLoading(false));
  }, [postId]);

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
      case 'role':
        const roleOrder = { Lead: 0, Contributor: 1, Viewer: 2 };
        return (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3);
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
      // Refresh members list or show success toast
      const { data } = await api.get(`/workspace/${postId}/members`);
      setMembers(data.members);
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
      setMembers(prev => prev.map(m =>
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
      setMembers(prev => prev.filter(m => m.user._id !== userId));
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

  // Get stats
  const leadCount = members.filter(m => m.role === 'Lead').length;
  const contributorCount = members.filter(m => m.role === 'Contributor').length;
  const viewerCount = members.filter(m => m.role === 'Viewer').length;
  const onlineCount = members.filter(m => onlineUsers.has(m.user._id)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with stats and actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {onlineCount} online now
            </span>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Crown size={11} /> {leadCount} Lead
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <User size={11} /> {contributorCount} Contributors
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Eye size={11} /> {viewerCount} Viewers
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              background: 'var(--input-bg)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="joinedAt">Sort by: Joined</option>
            <option value="name">Sort by: Name</option>
            <option value="role">Sort by: Role</option>
          </select>
          {isOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                minHeight: '44px',
                boxSizing: 'border-box',
                borderRadius: '8px',
                border: 'none',
                background: CC,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: `0 4px 12px ${CC}40`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 6px 20px ${CC}60`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 4px 12px ${CC}40`)}
            >
              <Plus size={14} /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Member list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {sortedMembers.map(({ user, role, joinedAt }) => {
          const isOnline = onlineUsers.has(user._id);
          const roleInfo = roleColors[role] || roleColors.Contributor;
          const isCurrentUser = user._id === currentUser?._id;

          return (
            <div
              key={user._id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-muted)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--card-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Avatar with online status */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Link to={`/profile/${user._id}`}>
                  <Avatar name={user.name} src={user.avatarUrl} size={44} />
                </Link>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    border: '2px solid var(--card-bg)',
                    background: isOnline ? '#16a34a' : '#6b7280',
                  }}
                />
              </div>

              {/* User info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    to={`/profile/${user._id}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {user.name}
                    </span>
                    {isCurrentUser && (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: '4px' }}>
                        You
                      </span>
                    )}
                  </Link>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: roleInfo.bg,
                      color: roleInfo.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <roleInfo.icon size={11} /> {role}
                  </span>
                  {isOnline && (
                    <span style={{
                      fontSize: '10px',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#16a34a',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite',
                      }} />
                      Online
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  @{user.username} · joined {timeAgo(joinedAt)}
                </p>
              </div>

              {/* Owner actions */}
              {isOwner && !isCurrentUser && (
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {/* Role dropdown */}
                  <select
                    value={role}
                    onChange={(e) => handleChangeRole(user._id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'var(--input-bg)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Contributor">Contributor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(user._id, user.name)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'transparent',
                      color: '#dc2626',
                      fontSize: '11px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
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
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--surface-2)',
          borderRadius: '12px',
          border: '2px dashed var(--border)',
        }}>
          <Users size={48} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            No members yet
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {isOwner ? 'Invite your team members to start collaborating.' : 'The project owner will add members soon.'}
          </p>
          {isOwner && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: CC,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} /> Invite first member
            </button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px 32px',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Invite Member
              </h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email or Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email or username..."
                  onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CC)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Enter the email address or username of the person you want to invite.
                </p>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Contributor">Contributor – Can create and update tasks</option>
                  <option value="Viewer">Viewer – Can only view tasks and discussions</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviting}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    background: !inviteEmail.trim() || inviting ? 'var(--surface-2)' : CC,
                    color: !inviteEmail.trim() || inviting ? 'var(--text-muted)' : '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: !inviteEmail.trim() || inviting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: !inviteEmail.trim() || inviting ? 'none' : `0 4px 12px ${CC}40`,
                  }}
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

/* ── Discussion section — real-time via Socket.io ── */
function Discussion({ postId, leadId }) {
  const { user }    = useAuthStore();
  const connected   = useSocketStore((s) => s.connected);

  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [text,      setText]      = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);

  /* Load history + join socket room */
  useEffect(() => {
    api.get(`/workspace/${postId}/messages`)
      .then(r => setMessages(r.data.messages))
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (!socket) return;

    socket.emit('project:join', { postId });

    const onMsg = (msg) => {
      setMessages(prev => {
        // deduplicate by _id (in case REST and socket race)
        if (prev.some(m => m._id?.toString() === msg._id?.toString())) return prev;
        return [...prev, msg];
      });
    };

    const onTyping = ({ userId: uid, isTyping }) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        isTyping ? next.add(uid) : next.delete(uid);
        return next;
      });
    };

    socket.on('project:message:receive', onMsg);
    socket.on('project:typing',          onTyping);

    return () => {
      socket.emit('project:leave', { postId });
      socket.off('project:message:receive', onMsg);
      socket.off('project:typing',          onTyping);
    };
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
      // Fallback: REST if socket not connected
      api.post(`/workspace/${postId}/messages`, { text: text.trim() })
        .then(r => setMessages(prev => [...prev, r.data.message]));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '400px' }}>

      {/* Connection status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', padding: '6px 12px', borderRadius: '8px', background: connected ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${connected ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, width: 'fit-content' }}>
        {connected ? <Wifi size={13} color="#16a34a" /> : <WifiOff size={13} color="#dc2626" />}
        <span style={{ fontSize: '12px', fontWeight: '600', color: connected ? '#16a34a' : '#dc2626' }}>
          {connected ? 'Live — messages appear instantly' : 'Offline — reconnecting…'}
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '14px' }}>No messages yet. Start the discussion!</p>
          </div>
        ) : messages.map((msg, i) => {
          const isMe       = msg.author._id === user?._id || msg.author === user?._id;
          const prevAuthor = messages[i - 1]?.author?._id ?? messages[i - 1]?.author;
          const thisAuthor = msg.author?._id ?? msg.author;
          const showMeta   = i === 0 || prevAuthor !== thisAuthor;
          const isLead     = leadId && String(thisAuthor) === leadId;

          return (
            <motion.div key={msg._id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexDirection: isMe ? 'row-reverse' : 'row', marginTop: showMeta ? '8px' : '0' }}>
              {showMeta
                ? <Avatar name={msg.author?.name} src={msg.author?.avatarUrl} size={28} />
                : <div style={{ width: 28, flexShrink: 0 }} />}
              <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: '2px' }}>
                {showMeta && !isMe && (
                  <span style={{ fontSize: '11px', color: isLead ? CC : 'var(--text-muted)', fontWeight: '600', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {msg.author?.name}
                    {isLead && <Crown size={11} color={CC} />}
                  </span>
                )}
                <div style={{
                  padding: '9px 13px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe ? CC : isLead ? `${CC}14` : 'var(--surface-2)',
                  border: !isMe && isLead ? `1.5px solid ${CC}45` : 'none',
                  color: isMe ? '#fff' : isLead ? 'var(--text-primary)' : 'var(--text-primary)',
                  fontSize: '14px', lineHeight: '1.5',
                  wordBreak: 'break-word',
                  fontWeight: !isMe && isLead ? '500' : '400',
                }}>
                  {msg.text}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px', marginRight: '4px' }}>
                  {timeAgo(msg.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {othersTyping && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingLeft: '36px' }}>
              <div style={{ display: 'flex', gap: '3px', padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '12px' }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                ))}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>typing…</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input — open to every member */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
        <input value={text} onChange={handleTyping}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={connected ? 'Type a message… (Enter to send)' : 'Reconnecting…'}
          aria-label="Discussion message"
          style={{ flex: 1, minHeight: '44px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '16px', color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.15s' }}
          onFocus={e => (e.target.style.borderColor = CC)}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
        <motion.button whileTap={{ scale: 0.95 }} onClick={send} disabled={!text.trim()}
          aria-label="Send message"
          style={{ width: 44, height: 44, borderRadius: '10px', border: 'none', background: text.trim() ? CC : 'var(--surface-2)', color: text.trim() ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: text.trim() ? 'pointer' : 'not-allowed', flexShrink: 0, boxShadow: text.trim() ? `0 4px 12px ${CC}40` : 'none', transition: 'all 0.15s' }}>
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}

/* ── Resources section ── */

function Resources({ postId, isOwner }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ title: '', url: '', type: 'other', description: '' });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    api.get(`/workspace/${postId}/resources`).then(r => setResources(r.data.resources)).finally(() => setLoading(false));
  }, [postId]);

  const addResource = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/workspace/${postId}/resources`, form);
      setResources(prev => [data.resource, ...prev]);
      setForm({ title: '', url: '', type: 'other', description: '' });
      setIsModalOpen(false);
    } finally { setSaving(false); }
  };

  const updateResource = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/workspace/${postId}/resources/${editingId}`, form);
      setResources(prev => prev.map(r => r._id === editingId ? data.resource : r));
      setForm({ title: '', url: '', type: 'other', description: '' });
      setEditingId(null);
      setIsModalOpen(false);
    } finally { setSaving(false); }
  };

  const removeResource = async (id) => {
    if (!await confirm('Remove this resource?', { title: 'Remove resource', confirmLabel: 'Remove' })) return;
    await api.delete(`/workspace/${postId}/resources/${id}`);
    setResources(prev => prev.filter(r => r._id !== id));
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

  // Filter and search
  const filteredResources = resources.filter(r => {
    const matchesType = filter === 'all' || r.type === filter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Get type counts for filter badges
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {resources.length} resource{resources.length !== 1 ? 's' : ''}
          </span>
          {resources.length > 0 && (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {resources.filter(r => r.type === 'github').length} GitHub · {resources.filter(r => r.type === 'figma').length} Figma
            </span>
          )}
        </div>
        {isOwner && (
          <button
            onClick={openAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              boxSizing: 'border-box',
              borderRadius: '8px',
              border: 'none',
              background: CC,
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${CC}40`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 6px 20px ${CC}60`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 4px 12px ${CC}40`)}
          >
            <Plus size={16} /> Add Resource
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1.5px solid var(--border)',
              background: 'var(--input-bg)',
              fontSize: '14px',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.target.style.borderColor = CC)}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {resourceTypes.map(({ id, label, icon: Icon, color }) => {
            const isActive = filter === id;
            const count = id === 'all' ? resources.length : typeCounts[id] || 0;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: `1.5px solid ${isActive ? CC : 'var(--border)'}`,
                  background: isActive ? `${CC}14` : 'transparent',
                  color: isActive ? CC : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
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
                <span style={{
                  fontSize: '10px',
                  opacity: 0.6,
                  marginLeft: '2px',
                }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resource grid */}
      {filteredResources.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--surface-2)',
          borderRadius: '12px',
          border: '2px dashed var(--border)',
        }}>
          <BookOpen size={48} style={{ marginBottom: '12px', opacity: 0.3, color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {searchQuery || filter !== 'all' ? 'No matching resources' : 'No resources yet'}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add your GitHub repo, design file, or documentation to get started.'
            }
          </p>
          {isOwner && !searchQuery && filter === 'all' && (
            <button
              onClick={openAddModal}
              style={{
                marginTop: '16px',
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                background: CC,
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} style={{ display: 'inline', marginRight: '4px' }} /> Add your first resource
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {filteredResources.map(r => {
            const { icon: Icon, color, label } = RESOURCE_ICONS[r.type] ?? RESOURCE_ICONS.other;
            return (
              <div
                key={r._id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {/* Icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: `${color}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color={color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {r.title}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: `${color}12`,
                        color: color,
                        flexShrink: 0,
                      }}>
                        {label}
                      </span>
                    </div>
                    {r.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: '1.4' }}>
                        {r.description}
                      </p>
                    )}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        wordBreak: 'break-all',
                      }}
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--divider)',
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Added {timeAgo(r.createdAt)}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--surface-2)',
                        color: 'var(--text-secondary)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = CC;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--surface-2)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      Open →
                    </a>
                    {isOwner && (
                      <>
                        <button
                          onClick={() => openEditModal(r)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = CC;
                            e.currentTarget.style.color = CC;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => removeResource(r._id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(239,68,68,0.2)',
                            background: 'transparent',
                            color: '#dc2626',
                            fontSize: '11px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--card-bg)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px 32px',
              border: '1px solid var(--border)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {editingId ? 'Edit Resource' : 'Add Resource'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Resource Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., Backend API Docs"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CC)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  URL <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://github.com/your-repo"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CC)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="github">GitHub</option>
                  <option value="figma">Figma</option>
                  <option value="docs">Docs</option>
                  <option value="deploy">Deploy</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this resource..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'var(--input-bg)',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CC)}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? updateResource : addResource}
                  disabled={!form.title.trim() || !form.url.trim() || saving}
                  style={{
                    padding: '10px 28px',
                    borderRadius: '10px',
                    border: 'none',
                    background: !form.title.trim() || !form.url.trim() || saving ? 'var(--surface-2)' : CC,
                    color: !form.title.trim() || !form.url.trim() || saving ? 'var(--text-muted)' : '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: !form.title.trim() || !form.url.trim() || saving ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: !form.title.trim() || !form.url.trim() || saving ? 'none' : `0 4px 12px ${CC}40`,
                  }}
                >
                  {saving ? 'Saving...' : (editingId ? 'Update Resource' : 'Add Resource')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Loader ── */
function Loader() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader2 size={24} color={CC} style={{ animation: 'spin 0.8s linear infinite' }} /></div>;
}

/* ── Sidebar nav item ── */
const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'tasks',       label: 'Tasks',       icon: CheckSquare     },
  { id: 'members',     label: 'Members',     icon: Users           },
  { id: 'discussion',  label: 'Discussion',  icon: MessageSquare   },
  { id: 'resources',   label: 'Resources',   icon: BookOpen        },
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
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState("todo");
  const [saving, setSaving] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/posts/${postId}/tasks`).then(r => { 
      setTasks(r.data.tasks); 
      if (r.data.tasks.length) setSelected(r.data.tasks[0]); 
    }).finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    setShowReviewForm(false);
    setReviewNote('');
  }, [selected?._id]);

  const refresh = async () => {
    const { data } = await api.get(`/posts/${postId}/tasks`);
    setTasks(data.tasks);
    if (selected) setSelected(data.tasks.find(t => t._id === selected._id) ?? null);
  };

  const patch = async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    if (selected?._id === taskId) setSelected(data.task);
  };

  const addTask = async (taskData) => {
    setSaving(true);
    try {
      await api.post(`/posts/${postId}/tasks`, taskData);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (id) => {
    if (!await confirm('Delete this task?', { title: 'Delete task', confirmLabel: 'Delete' })) return;
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t._id !== id));
    if (selected?._id === id) setSelected(null);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Task Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {tasks.filter(t => t.status === 'done').length} completed
          </span>
        </div>
        {isOwner && (
          <button
            onClick={() => { setModalStatus('todo'); setIsModalOpen(true); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              minHeight: '44px',
              boxSizing: 'border-box',
              borderRadius: '8px',
              border: 'none',
              background: CC,
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: `0 4px 12px ${CC}40`,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 6px 20px ${CC}60`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 4px 12px ${CC}40`)}
          >
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', alignItems: 'flex-start', paddingBottom: '12px' }}>
        {STATUSES.map(({ id: status, label, color }) => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} style={{ 
              width: '280px', 
              flexShrink: 0, 
              background: 'var(--surface-2)', 
              borderRadius: '12px', 
              padding: '12px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    color: 'var(--text-muted)', 
                    background: 'var(--surface-3)', 
                    padding: '0 6px', 
                    borderRadius: '8px' 
                  }}>
                    {colTasks.length}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => { setModalStatus(status); setIsModalOpen(true); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                  style={{ 
                    background: 'var(--card-bg)', 
                    borderRadius: '8px', 
                    padding: '12px', 
                    border: selected?._id === task._id ? `2px solid ${CC}` : '1px solid var(--card-border)', 
                    cursor: 'pointer', 
                    boxShadow: selected?._id === task._id ? `0 0 0 3px ${CC}15` : 'none',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (selected?._id !== task._id) {
                      e.currentTarget.style.borderColor = 'var(--text-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected?._id !== task._id) {
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                    }
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.4' }}>
                    {task.title}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '600', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      background: `${PRIORITY_COLORS[task.priority] || '#6b7280'}15`, 
                      color: PRIORITY_COLORS[task.priority] || '#6b7280' 
                    }}>
                      {task.priority || 'medium'}
                    </span>
                    {task.checklist?.length > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <CheckSquare size={10} /> {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                      </span>
                    )}
                    {task.assignees?.length > 0 && (
                      <div style={{ display: 'flex', gap: '-4px' }}>
                        {task.assignees.slice(0, 2).map((a, i) => (
                          <Avatar key={i} name={a} size={18} />
                        ))}
                        {task.assignees.length > 2 && (
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '2px' }}>
                            +{task.assignees.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {task.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}

              {isOwner && (
                <button 
                  onClick={() => { setModalStatus(status); setIsModalOpen(true); }}
                  style={{ 
                    width: '100%', 
                    padding: '7px', 
                    borderRadius: '7px', 
                    border: '1.5px dashed var(--border)', 
                    background: 'transparent', 
                    color: 'var(--text-muted)', 
                    fontSize: '11px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '4px',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = CC;
                    e.currentTarget.style.color = CC;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Plus size={11} /> Add task
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Panel - same as before but enhanced */}
      {selected && (
        <div style={{ 
          marginTop: '16px',
          background: 'var(--card-bg)', 
          border: '1px solid var(--card-border)', 
          borderRadius: '12px', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {isOwner ? (
                <input 
                  value={selected.title} 
                  onChange={e => setSelected(s => ({ ...s, title: e.target.value }))}
                  onBlur={() => patch(selected._id, { title: selected.title })}
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: 'var(--text-primary)', 
                    background: 'transparent', 
                    border: 'none', 
                    outline: 'none', 
                    borderBottom: '2px solid var(--border)', 
                    paddingBottom: '6px',
                    width: '100%',
                  }} 
                />
              ) : (
                <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{selected.title}</p>
              )}
              {selected.description && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{selected.description}</p>
              )}
            </div>
            <span style={{
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600',
              background: `${STATUSES.find(s => s.id === selected.status)?.color ?? '#6b7280'}1f`,
              color: STATUSES.find(s => s.id === selected.status)?.color ?? '#6b7280',
              flexShrink: 0,
            }}>
              {STATUSES.find(s => s.id === selected.status)?.label || selected.status}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Status buttons */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {STATUSES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => isOwner && patch(selected._id, { status: s.id })}
                    title={!isOwner ? 'Only the lead can set this directly — use Submit for Review below' : undefined}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: `1.5px solid ${selected.status === s.id ? s.color : 'var(--border)'}`,
                      background: selected.status === s.id ? `${s.color}14` : 'transparent',
                      color: selected.status === s.id ? s.color : 'var(--text-secondary)',
                      fontSize: '10px',
                      fontWeight: selected.status === s.id ? '700' : '400',
                      cursor: isOwner ? 'pointer' : 'not-allowed',
                      opacity: !isOwner && selected.status !== s.id ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Priority</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['low', 'medium', 'high'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => isOwner && patch(selected._id, { priority: p })}
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      border: `1.5px solid ${selected.priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`, 
                      background: selected.priority === p ? `${PRIORITY_COLORS[p]}14` : 'transparent', 
                      color: selected.priority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)', 
                      fontSize: '10px', 
                      fontWeight: selected.priority === p ? '700' : '400', 
                      cursor: isOwner ? 'pointer' : 'default',
                      opacity: !isOwner && selected.priority !== p ? 0.5 : 1,
                      textTransform: 'capitalize',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Due Date</label>
              {isOwner ? (
                <input 
                  type="date" 
                  value={selected.dueDate?.slice(0, 10) ?? ''} 
                  onChange={e => patch(selected._id, { dueDate: e.target.value || null })}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border)', 
                    background: 'var(--input-bg)', 
                    fontSize: '11px', 
                    color: 'var(--text-primary)', 
                    outline: 'none',
                  }} 
                />
              ) : selected.dueDate ? (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(selected.dueDate).toLocaleDateString()}
                </span>
              ) : null}
            </div>
          </div>

          {/* Review workflow */}
          {!isOwner && selected.status !== 'done' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              {selected.status === 'in_review' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)' }}>
                  <ClipboardCheck size={15} color={CC} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: CC, marginBottom: '4px' }}>Waiting for lead review</p>
                    {selected.completionNote && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selected.completionNote}</p>
                    )}
                  </div>
                </div>
              ) : showReviewForm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    What did you complete?
                  </label>
                  <textarea
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    placeholder="Describe what you did, so the lead can review it…"
                    rows={3}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                    onFocus={e => (e.target.style.borderColor = CC)}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={submitForReview}
                      disabled={!reviewNote.trim() || submittingReview}
                      style={{ minHeight: '36px', padding: '6px 16px', borderRadius: '8px', border: 'none', background: !reviewNote.trim() || submittingReview ? 'var(--surface-2)' : CC, color: !reviewNote.trim() || submittingReview ? 'var(--text-muted)' : '#fff', fontSize: '12px', fontWeight: '700', cursor: !reviewNote.trim() || submittingReview ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {submittingReview ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ClipboardCheck size={13} />}
                      Submit for review
                    </button>
                    <button
                      onClick={() => { setShowReviewForm(false); setReviewNote(''); }}
                      style={{ minHeight: '36px', padding: '6px 16px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '40px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: CC, color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 3px 10px ${CC}30` }}
                >
                  <ClipboardCheck size={14} /> Mark complete for review
                </button>
              )}
            </div>
          )}

          {selected.status === 'done' && selected.completionNote && (
            <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={13} /> Completed by {selected.completedBy?.name || 'a contributor'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selected.completionNote}</p>
            </div>
          )}

          {isOwner && selected.status === 'in_review' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.2)', marginBottom: '10px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: CC, marginBottom: '4px' }}>
                  Submitted by {selected.completedBy?.name || 'a contributor'} for review
                </p>
                {selected.completionNote && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selected.completionNote}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={approveTask}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 16px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  <CheckCircle size={13} /> Approve
                </button>
                <button
                  onClick={requestChanges}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '36px', padding: '6px 16px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  <RotateCcw size={13} /> Request changes
                </button>
              </div>
            </div>
          )}

          {/* Checklist */}
          {selected.checklist?.length > 0 && (
            <div>
              <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Checklist ({selected.checklist.filter(i => i.completed).length}/{selected.checklist.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selected.checklist.map((item, idx) => (
                  <div 
                    key={idx} 
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: isOwner ? 'pointer' : 'default' }}
                    onClick={() => isOwner && toggleChecklist(idx)}
                  >
                    {item.completed ? <CheckCircle size={14} color="#16a34a" /> : <Circle size={14} color="var(--text-muted)" />}
                    <span style={{ 
                      fontSize: '12px', 
                      color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', 
                      textDecoration: item.completed ? 'line-through' : 'none' 
                    }}>
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
              <label style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assignees</label>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {selected.assignees.map((a, i) => (
                  <span key={i} style={{ 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: 'rgba(8,145,178,0.1)', 
                    color: CC, 
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {a}
                    {isOwner && (
                      <button
                        onClick={() => patch(selected._id, { assignees: selected.assignees.filter((_, idx) => idx !== i) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: CC, padding: '0', fontSize: '12px' }}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <button 
                onClick={addChecklistItem}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  border: '1px dashed var(--border)', 
                  background: 'transparent', 
                  color: 'var(--text-muted)', 
                  fontSize: '11px', 
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = CC; e.currentTarget.style.color = CC; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Plus size={12} /> Add checklist item
              </button>
              <button 
                onClick={() => deleteTask(selected._id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(239,68,68,0.2)', 
                  background: 'rgba(239,68,68,0.06)', 
                  color: '#dc2626', 
                  fontSize: '11px', 
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
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
        projectMembers={[]} // You can pass project members here if available
      />
    </div>
  );
}


/* ── Add Task Modal ── */
function AddTaskModal({ isOpen, onClose, onAdd, defaultStatus, projectMembers = [] }) {
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: "16px",
          maxWidth: "580px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 32px",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-primary)" }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Title */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Task Title <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = CC)}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task in detail..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              fontSize: "14px",
              color: "var(--text-primary)",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = CC)}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Priority & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Priority
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: `1.5px solid ${priority === p ? PRIORITY_COLORS[p] : "var(--border)"}`,
                    background: priority === p ? `${PRIORITY_COLORS[p]}18` : "transparent",
                    color: priority === p ? PRIORITY_COLORS[p] : "var(--text-secondary)",
                    fontSize: "12px",
                    fontWeight: priority === p ? "700" : "500",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.15s",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Assignees */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                fontSize: "13px",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Assignees
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
              {assignees.map((name) => (
                <span
                  key={name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: "rgba(8,145,178,0.12)",
                    color: CC,
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {name}
                  <button
                    onClick={() => handleRemoveAssignee(name)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: CC,
                      padding: "0 2px",
                      fontSize: "14px",
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
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
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1.5px solid var(--border)",
                  background: "var(--input-bg)",
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => handleAddAssignee(assigneeInput)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: CC,
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Checklist
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
            {checklistItems.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => handleToggleChecklistItem(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: item.completed ? "#16a34a" : "var(--text-muted)",
                    padding: 0,
                  }}
                >
                  {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <span style={{ fontSize: "13px", color: item.completed ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.completed ? "line-through" : "none", flex: 1 }}>
                  {item.text}
                </span>
                <button
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: "2px",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
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
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddChecklistItem}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: CC,
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
            Tags
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  background: "rgba(139,92,246,0.12)",
                  color: "#8b5cf6",
                  fontSize: "11px",
                  fontWeight: "500",
                }}
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#8b5cf6",
                    padding: "0 2px",
                    fontSize: "12px",
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
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
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1.5px solid var(--border)",
                background: "var(--input-bg)",
                fontSize: "12px",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddTag}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "none",
                background: "#8b5cf6",
                color: "#fff",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            style={{
              padding: "10px 28px",
              borderRadius: "10px",
              border: "none",
              background: !title.trim() || isSubmitting ? "var(--surface-2)" : CC,
              color: !title.trim() || isSubmitting ? "var(--text-muted)" : "#fff",
              fontSize: "14px",
              fontWeight: "700",
              cursor: !title.trim() || isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              boxShadow: !title.trim() || isSubmitting ? "none" : `0 4px 12px ${CC}40`,
            }}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
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
  const [postTitle, setPostTitle] = useState('Workspace');
  const [isOwner,   setIsOwner]   = useState(false);
  const [leadId,    setLeadId]    = useState(null);
  const [roleReady, setRoleReady] = useState(false);

  useEffect(() => {
    api.get(`/workspace/${postId}/overview`)
      .then(r => {
        const post = r.data.post;
        setPostTitle(post?.projectName || post?.title || 'Workspace');
        // Compare author id with current user id
        const authorId = post?.author?._id ?? post?.author;
        setIsOwner(String(authorId) === String(user?._id));
        setLeadId(authorId ? String(authorId) : null);
      })
      .catch(() => {})
      .finally(() => setRoleReady(true));
  }, [postId, user?._id]);

  const renderSection = () => {
    switch (section) {
      case 'overview':   return <Overview   postId={postId} isOwner={isOwner} />;
      case 'tasks':      return <Tasks      postId={postId} isOwner={isOwner} />;
      case 'members':    return <Members    postId={postId} isOwner={isOwner} />;
      case 'discussion': return <Discussion postId={postId} isOwner={isOwner} leadId={leadId} />;
      case 'resources':  return <Resources  postId={postId} isOwner={isOwner} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="workspace-layout" style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar (desktop) */}
        <aside className="workspace-sidebar" style={{ width: '220px', flexShrink: 0, background: 'var(--card-bg)', borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'sticky', top: '60px', height: 'calc(100svh - 60px)', overflowY: 'auto' }}>
          {/* Back */}
          <button onClick={() => navigate('/collab')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px', minHeight: '40px', boxSizing: 'border-box', borderRadius: '8px', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '8px', textAlign: 'left', transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            <ArrowLeft size={13} /> Collab Hub
          </button>

          {/* Project name + role */}
          <div style={{ padding: '10px 10px 14px', borderBottom: '1px solid var(--divider)', marginBottom: '8px' }}>
            <p style={{ fontSize: '12px', color: CC, fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</p>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.3', marginBottom: '8px' }}>{postTitle}</p>
            {roleReady && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                background: isOwner ? `${CC}18` : 'rgba(34,197,94,0.1)',
                color: isOwner ? CC : '#16a34a',
                border: `1px solid ${isOwner ? CC + '35' : 'rgba(34,197,94,0.25)'}`,
              }}>
                {isOwner ? <Crown size={11} /> : <User size={11} />} {isOwner ? 'Owner' : 'Member'}
              </span>
            )}
          </div>

          {/* Nav items */}
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <motion.button key={id} onClick={() => setSection(id)} whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px', minHeight: '44px', boxSizing: 'border-box', borderRadius: '9px', border: 'none',
                  background: active ? `${CC}14` : 'transparent',
                  color: active ? CC : 'var(--text-secondary)',
                  fontSize: '14px', fontWeight: active ? '700' : '500',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'background 0.12s, color 0.12s',
                }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
                {active && <motion.div layoutId="sidebar-indicator" style={{ position: 'absolute', left: 0, width: '3px', height: '28px', background: CC, borderRadius: '0 2px 2px 0' }} />}
              </motion.button>
            );
          })}
        </aside>

        {/* Tab bar (mobile/tablet) */}
        <nav className="workspace-tabbar" style={{ display: 'none', overflowX: 'auto', gap: '4px', padding: '10px 12px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button key={id} onClick={() => setSection(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
                  padding: '10px 14px', minHeight: '44px', boxSizing: 'border-box', borderRadius: '9px', border: 'none',
                  background: active ? `${CC}14` : 'transparent',
                  color: active ? CC : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: active ? '700' : '500',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'background 0.12s, color 0.12s',
                }}>
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', overflowX: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: section === 'tasks' ? 'none' : '800px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '20px', letterSpacing: '-0.3px' }}>
              {NAV_ITEMS.find(n => n.id === section)?.label}
            </h1>
            <AnimatePresence mode="wait">
              <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}

        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible, a:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid ${CC};
          outline-offset: 2px;
        }

        /* Below 900px: collapse the persistent sidebar into a horizontal tab bar */
        @media (max-width: 899px) {
          .workspace-layout { flex-direction: column; }
          .workspace-sidebar { display: none !important; }
          .workspace-tabbar { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
