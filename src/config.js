const isLocalHost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (isLocalHost ? 'http://localhost:3000' : 'https://community-backend-1-gfv6.onrender.com');
