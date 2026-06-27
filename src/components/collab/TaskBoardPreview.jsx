import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, CheckSquare, Square,
  Calendar, AlertCircle, ChevronDown, Loader2,
} from 'lucide-react';
import Navbar from '../layout/Navbar';
import api from '../../api/axiosInstance';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';

const STATUSES = [
  { id: 'todo',        label: 'To Do',       color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress',  color: '#d97706' },
  { id: 'done',        label: 'Done',         color: '#16a34a' },
];

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' };

function Avatar({ name, src, size = 22 }) {
  const initials = (name ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...(name ?? 'U')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: '700' }}>{initials}</div>;
}

export default function TaskBoardPreview() {
  const { id: postId } = useParams();
  const navigate       = useNavigate();
  const { user }       = useAuthStore();

  const [post,         setPost]         = useState(null);
  const [tasks,        setTasks]        = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [addingStatus, setAddingStatus] = useState(null);
  const [newTitle,     setNewTitle]     = useState('');
  const [saving,       setSaving]       = useState(false);

  /* Load project + tasks */
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const [postRes, tasksRes] = await Promise.all([
          api.get(`/posts/${postId}`),
          api.get(`/posts/${postId}/tasks`),
        ]);
        setPost(postRes.data.post ?? postRes.data);
        setTasks(tasksRes.data.tasks);
        if (tasksRes.data.tasks.length) setSelected(tasksRes.data.tasks[0]);
      } catch (err) {
        setError(err.response?.data?.message ?? 'Failed to load project.');
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  /* Helpers */
  const refreshTasks = async () => {
    const { data } = await api.get(`/posts/${postId}/tasks`);
    setTasks(data.tasks);
    if (selected) setSelected(data.tasks.find(t => t._id === selected._id) ?? data.tasks[0] ?? null);
  };

  const addTask = async (status) => {
    if (!newTitle.trim()) return;
    setSaving(true);
    try {
      await api.post(`/posts/${postId}/tasks`, { title: newTitle.trim(), status });
      setNewTitle(''); setAddingStatus(null);
      await refreshTasks();
    } finally { setSaving(false); }
  };

  const patch = async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    setTasks(prev => prev.map(t => t._id === taskId ? data.task : t));
    if (selected?._id === taskId) setSelected(data.task);
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t._id !== taskId));
    if (selected?._id === taskId) setSelected(tasks.find(t => t._id !== taskId) ?? null);
  };

  const toggleChecklistItem = async (idx) => {
    const updated = selected.checklist.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item);
    await patch(selected._id, { checklist: updated });
  };

  const addChecklistItem = async () => {
    const updated = [...(selected.checklist ?? []), { text: 'New item', completed: false }];
    await patch(selected._id, { checklist: updated });
  };

  /* Loading / error states */
  if (loading) return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--error-text)' }}>
        <AlertCircle size={36} style={{ marginBottom: '12px' }} />
        <p style={{ fontSize: '15px', fontWeight: '600' }}>{error}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/collab')} style={{ marginTop: '16px' }}>
          ← Back to Collab
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100svh', background: 'var(--surface-0)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Top bar */}
      <div style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', position: 'sticky', top: '60px', zIndex: 80 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/collab')} style={{ gap: '5px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={13} /> Collab Hub
        </Button>
        <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {post?.projectName || post?.title}
        </span>
        {post?.domain && (
          <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            {post.domain}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Board + detail pane */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100svh - 120px)' }}>

        {/* Kanban columns */}
        <div style={{ flex: 1, display: 'flex', gap: '0', overflowX: 'auto', padding: '20px', gap: '14px', alignItems: 'flex-start' }}>
          {STATUSES.map(({ id: status, label, color }) => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} style={{ width: '280px', flexShrink: 0, background: 'var(--surface-2)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Column header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface-3)', padding: '1px 6px', borderRadius: '10px' }}>{colTasks.length}</span>
                  </div>
                  <button onClick={() => { setAddingStatus(status); setNewTitle(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '2px' }}
                    aria-label="Add task">
                    <Plus size={16} />
                  </button>
                </div>

                {/* Task cards */}
                {colTasks.map(task => (
                  <motion.div key={task._id} layout whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                    onClick={() => setSelected(task)}
                    style={{
                      background: 'var(--card-bg)', borderRadius: '10px', padding: '12px',
                      border: selected?._id === task._id ? '1.5px solid var(--accent)' : '1px solid var(--card-border)',
                      cursor: 'pointer', transition: 'box-shadow 0.15s',
                      boxShadow: selected?._id === task._id ? '0 0 0 3px var(--accent-border)' : 'none',
                    }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4', marginBottom: '8px' }}>{task.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '4px', background: `${PRIORITY_COLORS[task.priority]}18`, color: PRIORITY_COLORS[task.priority] }}>
                        {task.priority}
                      </span>
                      <div style={{ display: 'flex', gap: '-4px' }}>
                        {task.assignees?.slice(0, 3).map((u, i) => (
                          <div key={u._id ?? i} style={{ marginLeft: i > 0 ? '-6px' : 0 }}>
                            <Avatar name={u.name} src={u.avatarUrl} size={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {task.checklist?.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <CheckSquare size={11} />
                        {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                      </div>
                    )}
                    {task.dueDate && (
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Add task inline */}
                <AnimatePresence>
                  {addingStatus === status && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--card-bg)', borderRadius: '10px', padding: '10px', border: '1.5px solid var(--accent)' }}>
                        <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addTask(status); if (e.key === 'Escape') setAddingStatus(null); }}
                          placeholder="Task title…"
                          style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Button size="sm" onClick={() => addTask(status)} disabled={!newTitle.trim() || saving}
                            style={{ flex: 1, padding: '5px', fontSize: '12px', minHeight: 'auto' }}>
                            {saving ? '…' : 'Add'}
                          </Button>
                          <button onClick={() => setAddingStatus(null)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add task button */}
                {addingStatus !== status && (
                  <button onClick={() => { setAddingStatus(status); setNewTitle(''); }}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                    <Plus size={13} /> Add task
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail pane */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: '320px', opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ flexShrink: 0, background: 'var(--card-bg)', borderLeft: '1px solid var(--border)', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

              {/* Title */}
              <input value={selected.title} onChange={e => setSelected(s => ({ ...s, title: e.target.value }))}
                onBlur={() => patch(selected._id, { title: selected.title })}
                style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', width: '100%', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }} />

              {/* Status */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Status</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {STATUSES.map(s => (
                    <button key={s.id} onClick={() => patch(selected._id, { status: s.id })}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${selected.status === s.id ? s.color : 'var(--border)'}`, background: selected.status === s.id ? `${s.color}18` : 'transparent', color: selected.status === s.id ? s.color : 'var(--text-secondary)', fontSize: '12px', fontWeight: selected.status === s.id ? '700' : '400', cursor: 'pointer', transition: 'all 0.12s' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Priority</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} onClick={() => patch(selected._id, { priority: p })}
                      style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${selected.priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`, background: selected.priority === p ? `${PRIORITY_COLORS[p]}18` : 'transparent', color: selected.priority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)', fontSize: '12px', fontWeight: selected.priority === p ? '700' : '400', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.12s' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>Due Date</label>
                <input type="date" value={selected.dueDate ? selected.dueDate.slice(0, 10) : ''}
                  onChange={e => patch(selected._id, { dueDate: e.target.value || null })}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--input-bg)', fontSize: '13px', color: 'var(--text-primary)', outline: 'none', width: '100%' }} />
              </div>

              {/* Checklist */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Checklist {selected.checklist?.length > 0 && `(${selected.checklist.filter(i => i.completed).length}/${selected.checklist.length})`}
                  </label>
                  <button onClick={addChecklistItem}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: '600' }}>
                    <Plus size={12} /> Add
                  </button>
                </div>
                {selected.checklist?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selected.checklist.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => toggleChecklistItem(idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.completed ? '#16a34a' : 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
                          {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                        <span style={{ fontSize: '13px', color: item.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: item.completed ? 'line-through' : 'none', flex: 1 }}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Progress bar */}
                {selected.checklist?.length > 0 && (
                  <div style={{ marginTop: '8px', height: '4px', borderRadius: '2px', background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#16a34a', borderRadius: '2px', width: `${(selected.checklist.filter(i => i.completed).length / selected.checklist.length) * 100}%`, transition: 'width 0.3s' }} />
                  </div>
                )}
              </div>

              {/* Delete */}
              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--divider)' }}>
                <Button variant="danger" fullWidth onClick={() => deleteTask(selected._id)} style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Trash2 size={13} /> Delete task
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
