import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { useSocketStore } from './stores/socketStore';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage  from './pages/ExplorePage';
import ProfilePage  from './pages/ProfilePage';
import CollabPage   from './pages/CollabPage';
import MessagesPage from './pages/MessagesPage';
import './App.css';

function ThemeApplier() {
  const { theme } = useThemeStore();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
  }, [theme]);
  return null;
}

function AuthHydrator({ children }) {
  const { accessToken, fetchMe, user } = useAuthStore();
  const { connect, disconnect, setMyId } = useSocketStore();

  useEffect(() => {
    if (accessToken) fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect / disconnect Socket.io based on auth state
  useEffect(() => {
    if (accessToken && user) {
      setMyId(user._id);
      connect(accessToken);
    } else {
      disconnect();
    }
    return () => { /* keep socket alive across navigations */ };
  }, [accessToken, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeApplier />
      <AuthHydrator>
        <Routes>
          <Route path="/"                    element={<LoginPage />} />
          <Route path="/register"            element={<RegisterPage />} />
          <Route path="/explore"             element={<ExplorePage />} />
          <Route path="/profile/:userId"     element={<ProfilePage />} />
          <Route path="/collab"              element={<CollabPage />} />
          <Route path="/messages"            element={<MessagesPage />} />
          <Route path="*"                    element={<Navigate to="/" replace />} />
        </Routes>
      </AuthHydrator>
    </BrowserRouter>
  );
}
