import { io } from 'socket.io-client';
import { create } from 'zustand';

let socket = null;

export const getSocket = () => socket;

export const useSocketStore = create((set, get) => ({
  connected: false,
  onlineUsers: new Set(),

  // Messages keyed by the OTHER user's id: { [userId]: Message[] }
  conversations: {},

  // { [senderId]: boolean }
  typingMap: {},

  connect(token) {
    if (socket?.connected) return;

    socket = io('http://localhost:3000', {
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
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
    set({ connected: false, onlineUsers: new Set(), conversations: {}, typingMap: {} });
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

  isOnline(userId) {
    return get().onlineUsers.has(userId);
  },
}));
