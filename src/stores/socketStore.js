import { io } from 'socket.io-client';
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { API_URL } from '../config';

let socket = null;

export const getSocket = () => socket;

export const useSocketStore = create((set, get) => ({
  connected: false,
  onlineUsers: new Set(),

  // Messages keyed by the OTHER user's id: { [userId]: Message[] }
  conversations: {},

  // Workspace discussion messages keyed by postId: { [postId]: Message[] }
  projectMessages: {},

  // { [senderId]: boolean }
  typingMap: {},

  notifications: [],
  unreadCount: 0,

  connect(token) {
    if (socket?.connected) return;

    socket = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('users:online', ({ userIds }) => {
      set({ onlineUsers: new Set(userIds) });
    });

    socket.on('user:online', ({ userId }) => {
      set((s) => ({ onlineUsers: new Set([...s.onlineUsers, userId]) }));
    });

    socket.on('user:offline', ({ userId }) => {
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.delete(userId);
        return { onlineUsers: next };
      });
    });

    socket.on('message:receive', (msg) => {
      // Store under the OTHER party's id
      const myId = get()._myId;
      const otherId = msg.sender === myId ? msg.receiver : msg.sender;
      set((s) => ({
        conversations: {
          ...s.conversations,
          [otherId]: [...(s.conversations[otherId] ?? []), msg],
        },
      }));
    });

    socket.on('message:typing', ({ senderId, isTyping }) => {
      set((s) => ({ typingMap: { ...s.typingMap, [senderId]: isTyping } }));
    });

    socket.on('project:message:receive', (msg) => {
      set((s) => {
        const existing = s.projectMessages[msg.post] ?? [];
        if (existing.some((m) => m._id?.toString() === msg._id?.toString())) return s;
        return { projectMessages: { ...s.projectMessages, [msg.post]: [...existing, msg] } };
      });
    });

    socket.on('notification:new', (notification) => {
      set((s) => ({
        notifications: [notification, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      }));
      toast(notification.text, { icon: '🔔' });
    });
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
    set({ connected: false, onlineUsers: new Set(), conversations: {}, projectMessages: {}, typingMap: {}, notifications: [], unreadCount: 0 });
  },

  seedNotifications(notifications, unreadCount) {
    set({ notifications, unreadCount });
  },

  markNotificationRead(id) {
    set((s) => ({
      notifications: s.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - (s.notifications.find((n) => n._id === id && !n.read) ? 1 : 0)),
    }));
  },

  markAllNotificationsRead() {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  // Store my own userId so we can route incoming messages
  setMyId(id) {
    set({ _myId: id });
  },

  sendMessage(receiverId, text) {
    socket?.emit('message:send', { receiverId, text });
  },

  sendTyping(receiverId, isTyping) {
    socket?.emit('message:typing', { receiverId, isTyping });
  },

  // Seed conversation from REST history
  seedConversation(userId, messages) {
    set((s) => ({
      conversations: {
        ...s.conversations,
        [userId]: messages,
      },
    }));
  },

  // Seed workspace discussion history from REST, or append a single message
  // sent through the REST fallback path (when the socket isn't connected)
  seedProjectMessages(postId, messages) {
    set((s) => ({
      projectMessages: { ...s.projectMessages, [postId]: messages },
    }));
  },

  appendProjectMessage(postId, message) {
    set((s) => ({
      projectMessages: {
        ...s.projectMessages,
        [postId]: [...(s.projectMessages[postId] ?? []), message],
      },
    }));
  },

  isOnline(userId) {
    return get().onlineUsers.has(userId);
  },
}));
