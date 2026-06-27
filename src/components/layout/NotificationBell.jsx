import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, CheckCheck } from 'lucide-react';
import { useSocketStore } from '../../stores/socketStore';
import api from '../../api/axiosInstance';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const {
    notifications, unreadCount,
    markNotificationRead, markAllNotificationsRead,
  } = useSocketStore();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      markNotificationRead(notification._id);
      api.patch(`/notifications/${notification._id}/read`).catch(() => {});
    }
    setOpen(false);
    if (notification.post) navigate(`/project/${notification.post}`);
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    api.patch('/notifications/read-all').catch(() => {});
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          position: 'relative', display: 'flex', alignItems: 'center',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          color: open ? 'var(--accent)' : 'var(--text-muted)', transition: 'color 0.15s',
        }}
      >
        <BellRing size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            minWidth: 15, height: 15, padding: '0 3px', borderRadius: '50%',
            background: 'var(--btn-grad)', color: '#fff',
            fontSize: '9px', fontWeight: '700',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--nav-bg)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: '-8px', zIndex: 500,
              background: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '14px', boxShadow: 'var(--shadow-popup)',
              width: '320px', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '13px 16px 11px', borderBottom: '1px solid var(--divider)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px', fontWeight: '600', padding: 0 }}
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* Body */}
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 16px', textAlign: 'center' }}>
                <BellRing size={28} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%',
                      padding: '11px 16px', background: n.read ? 'transparent' : 'var(--accent-dim)',
                      border: 'none', borderBottom: '1px solid var(--divider)',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = n.read ? 'transparent' : 'var(--accent-dim)'; }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: '6px',
                      background: n.read ? 'transparent' : 'var(--accent)',
                    }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>{n.text}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '3px 0 0' }}>{timeAgo(n.createdAt)} ago</p>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
