import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ConfirmDialogHost from "./components/ui/ConfirmDialog";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { useSocketStore } from "./stores/socketStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExplorePage from "./pages/ExplorePage";
import ProfilePage from "./pages/ProfilePage";
import CollabPage from "./pages/CollabPage";
import CollabRequestsPage from "./pages/CollabRequestsPage";
import MessagesPage from "./pages/MessagesPage";
import WorkspacePage from "./pages/WorkspacePage";
import "./App.css";

function ThemeApplier() {
  const { theme } = useThemeStore();
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", dark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
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
    return () => {
      /* keep socket alive across navigations */
    };
  }, [accessToken, user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeApplier />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-popup)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
      <ConfirmDialogHost />
      <AuthHydrator>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/collab" element={<CollabPage />} />
          <Route path="/collab/:postId/requests" element={<CollabRequestsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/project/:id" element={<WorkspacePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthHydrator>
    </BrowserRouter>
  );
}
