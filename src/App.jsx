import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import CollabPage from './pages/CollabPage';
import './App.css';

function AuthHydrator({ children }) {
  const { accessToken, fetchMe } = useAuthStore();

  useEffect(() => {
    if (accessToken) fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthHydrator>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/collab" element={<CollabPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthHydrator>
    </BrowserRouter>
  );
}
