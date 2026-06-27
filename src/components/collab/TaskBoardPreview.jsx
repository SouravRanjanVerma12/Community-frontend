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
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover border border-border" />;
  return <div style={{ width: size, height: size, background: `hsl(${hue},55%,55%)`, fontSize: size * 0.38 }} className="rounded-full text-white flex items-center justify-center font-bold">{initials}</div>;
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
    <div className="min-h-svh bg-surface-0">
      <Navbar />
      <div className="flex justify-center p-20">
        <Loader2 size={28} color="var(--accent)" className="animate-spin" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-svh bg-surface-0">
      <Navbar />
      <div className="text-center p-20 text-error">
        <AlertCircle size={36} className="mb-3" />
        <p className="text-[15px] font-semibold">{error}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/collab')} style={{ marginTop: '16px' }}>
          ← Back to Collab
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-surface-0 flex flex-col">
      <Navbar />

      {/* Top bar */}
      <div className="bg-nav border-b border-nav-border px-5 py-3 flex items-center gap-3 flex-wrap sticky top-[60px] z-80">
        <Button variant="ghost" size="sm" onClick={() => navigate('/collab')} style={{ gap: '5px', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={13} /> Collab Hub
        </Button>
        <div className="w-px h-5 bg-border" />
        <span className="text-[15px] font-bold text-text-primary">
          {post?.projectName || post?.title}
        </span>
        {post?.domain && (
          <span className="px-2.5 py-[3px] rounded-full text-[11px] font-semibold bg-accent-bg text-accent">
            {post.domain}
          </span>
        )}
        <div className="flex-1" />
        <span className="text-xs text-text-muted">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Board + detail pane */}
      <div className="flex flex-1 overflow-hidden h-[calc(100svh-120px)]">

        {/* Kanban columns */}
        <div className="flex-1 flex gap-3.5 overflow-x-auto p-5 items-start">
          {STATUSES.map(({ id: status, label, color }) => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="w-70 shrink-0 bg-surface-2 rounded-2xl p-3.5 flex flex-col gap-2.5">
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[13px] font-bold text-text-primary">{label}</span>
                    <span className="text-[11px] text-text-muted bg-surface-3 px-1.5 py-px rounded-[10px]">{colTasks.length}</span>
                  </div>
                  <button
                    onClick={() => { setAddingStatus(status); setNewTitle(''); }}
                    className="bg-none border-none cursor-pointer text-text-muted flex items-center p-0.5"
                    aria-label="Add task"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Task cards */}
                {colTasks.map(task => (
                  <motion.div
                    key={task._id} layout whileHover={{ y: -1, boxShadow: 'var(--shadow-md)' }}
                    onClick={() => setSelected(task)}
                    className={[
                      'bg-card rounded-[10px] p-3 cursor-pointer transition-shadow duration-150',
                      selected?._id === task._id ? 'border-[1.5px] border-accent' : 'border border-card-border',
                    ].join(' ')}
                    style={{ boxShadow: selected?._id === task._id ? '0 0 0 3px var(--accent-border)' : 'none' }}
                  >
                    <p className="text-[13px] font-semibold text-text-primary leading-[1.4] mb-2">{task.title}</p>
                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${PRIORITY_COLORS[task.priority]}18`, color: PRIORITY_COLORS[task.priority] }}>
                        {task.priority}
                      </span>
                      <div className="flex">
                        {task.assignees?.slice(0, 3).map((u, i) => (
                          <div key={u._id ?? i} className={i > 0 ? '-ml-1.5' : ''}>
                            <Avatar name={u.name} src={u.avatarUrl} size={20} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {task.checklist?.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-text-muted">
                        <CheckSquare size={11} />
                        {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-text-muted">
                        <Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Add task inline */}
                <AnimatePresence>
                  {addingStatus === status && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="flex flex-col gap-1.5 bg-card rounded-[10px] p-2.5 border-[1.5px] border-accent">
                        <input
                          autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addTask(status); if (e.key === 'Escape') setAddingStatus(null); }}
                          placeholder="Task title…"
                          className="px-2 py-1.5 rounded-md border border-border bg-input text-[13px] text-text-primary outline-none"
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" onClick={() => addTask(status)} disabled={!newTitle.trim() || saving} style={{ flex: 1, padding: '5px', fontSize: '12px', minHeight: 'auto' }}>
                            {saving ? '…' : 'Add'}
                          </Button>
                          <button onClick={() => setAddingStatus(null)} className="px-2 py-1.5 rounded-md border border-border bg-transparent text-text-muted text-xs cursor-pointer">
                            ✕
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Add task button */}
                {addingStatus !== status && (
                  <button
                    onClick={() => { setAddingStatus(status); setNewTitle(''); }}
                    className="w-full p-2 rounded-lg border-[1.5px] border-dashed border-border bg-transparent text-text-muted text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors duration-150 hover:border-accent hover:text-accent"
                  >
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
              className="shrink-0 bg-card border-l border-border overflow-y-auto overflow-x-hidden flex flex-col gap-4 p-5"
            >
              {/* Title */}
              <input
                value={selected.title} onChange={e => setSelected(s => ({ ...s, title: e.target.value }))}
                onBlur={() => patch(selected._id, { title: selected.title })}
                className="text-[15px] font-bold text-text-primary bg-transparent border-none outline-none w-full border-b border-border pb-2"
              />

              {/* Status */}
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Status</label>
                <div className="flex gap-1.5">
                  {STATUSES.map(s => (
                    <button
                      key={s.id} onClick={() => patch(selected._id, { status: s.id })}
                      className={`px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-120 ${selected.status === s.id ? 'font-bold' : 'font-normal'}`}
                      style={{
                        border: `1.5px solid ${selected.status === s.id ? s.color : 'var(--border)'}`,
                        background: selected.status === s.id ? `${s.color}18` : 'transparent',
                        color: selected.status === s.id ? s.color : 'var(--text-secondary)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Priority</label>
                <div className="flex gap-1.5">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p} onClick={() => patch(selected._id, { priority: p })}
                      className={`px-3 py-1.5 rounded-full text-xs capitalize cursor-pointer transition-all duration-120 ${selected.priority === p ? 'font-bold' : 'font-normal'}`}
                      style={{
                        border: `1.5px solid ${selected.priority === p ? PRIORITY_COLORS[p] : 'var(--border)'}`,
                        background: selected.priority === p ? `${PRIORITY_COLORS[p]}18` : 'transparent',
                        color: selected.priority === p ? PRIORITY_COLORS[p] : 'var(--text-secondary)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Due Date</label>
                <input
                  type="date" value={selected.dueDate ? selected.dueDate.slice(0, 10) : ''}
                  onChange={e => patch(selected._id, { dueDate: e.target.value || null })}
                  className="px-2.5 py-[7px] rounded-lg border-[1.5px] border-border bg-input text-[13px] text-text-primary outline-none w-full"
                />
              </div>

              {/* Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                    Checklist {selected.checklist?.length > 0 && `(${selected.checklist.filter(i => i.completed).length}/${selected.checklist.length})`}
                  </label>
                  <button onClick={addChecklistItem} className="bg-none border-none cursor-pointer text-accent flex items-center gap-[3px] text-xs font-semibold">
                    <Plus size={12} /> Add
                  </button>
                </div>
                {selected.checklist?.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {selected.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <button onClick={() => toggleChecklistItem(idx)} className={`bg-none border-none cursor-pointer p-0 shrink-0 ${item.completed ? 'text-[#16a34a]' : 'text-text-muted'}`}>
                          {item.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                        </button>
                        <span className={`text-[13px] flex-1 ${item.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Progress bar */}
                {selected.checklist?.length > 0 && (
                  <div className="mt-2 h-1 rounded-sm bg-surface-3 overflow-hidden">
                    <div
                      className="h-full bg-[#16a34a] rounded-sm transition-[width] duration-300"
                      style={{ width: `${(selected.checklist.filter(i => i.completed).length / selected.checklist.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Delete */}
              <div className="mt-auto pt-3 border-t border-divider">
                <Button variant="danger" fullWidth onClick={() => deleteTask(selected._id)} style={{ fontSize: '13px', fontWeight: '500' }}>
                  <Trash2 size={13} /> Delete task
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
