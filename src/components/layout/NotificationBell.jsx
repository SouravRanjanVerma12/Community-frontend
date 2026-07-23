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
    else if (['message', 'friend_request', 'friend_accepted'].includes(notification.type)) navigate('/messages');
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    api.patch('/notifications/read-all').catch(() => {});
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        className={`relative flex items-center bg-none border-none cursor-pointer p-0 transition-colors duration-150 ${open ? 'text-accent' : 'text-text-muted'}`}
      >
        <BellRing size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-(image:--btn-grad) text-white text-[9px] font-bold flex items-center justify-center border-2 border-nav">
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
            className="fixed top-16 right-3 sm:right-6 lg:absolute lg:top-[calc(100%+12px)] lg:left-auto lg:-right-2 z-500 bg-card border border-card-border rounded-2xl shadow-popup w-[min(340px,calc(100vw-24px))] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-[13px] pb-[11px] border-b border-divider flex items-center justify-between">
              <span className="text-sm font-bold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 bg-none border-none cursor-pointer text-accent text-xs font-semibold p-0"
                >
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            {/* Body */}
            {notifications.length === 0 ? (
              <div className="px-4 py-7 text-center">
                <BellRing size={28} color="var(--text-muted)" className="mb-2.5" />
                <p className="text-[13px] text-text-muted m-0">No notifications yet</p>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={[
                      'flex items-start gap-2.5 w-full px-4 py-[11px] border-none border-b border-divider',
                      'cursor-pointer text-left transition-colors duration-150 hover:bg-hover',
                      n.read ? 'bg-transparent' : 'bg-accent-dim',
                    ].join(' ')}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${n.read ? 'bg-transparent' : 'bg-accent'}`} />
                    <span className="flex-1 min-w-0">
                      <p className="text-[13px] text-text-primary m-0 leading-snug">{n.text}</p>
                      <p className="text-[11px] text-text-muted mt-[3px] mb-0">{timeAgo(n.createdAt)} ago</p>
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
