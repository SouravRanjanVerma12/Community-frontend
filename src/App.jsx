import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ConfirmDialogHost from "./components/ui/ConfirmDialog";
import OnboardingGate from "./components/onboarding/OnboardingGate";
import Spinner from "./components/ui/Spinner";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { useSocketStore } from "./stores/socketStore";
import { useFcmToken } from "./hooks/useFcmToken";
import api from "./api/axiosInstance";

const AuthPage           = lazy(() => import("./pages/AuthPage"));
const ExplorePage        = lazy(() => import("./pages/ExplorePage"));
const ProfilePage        = lazy(() => import("./pages/ProfilePage"));
const CollabPage         = lazy(() => import("./pages/CollabPage"));
const CollabRequestsPage = lazy(() => import("./pages/CollabRequestsPage"));
const MessagesPage       = lazy(() => import("./pages/MessagesPage"));
const WorkspacePage      = lazy(() => import("./pages/WorkspacePage"));
const JobsPage           = lazy(() => import("./pages/JobsPage"));
const JobApplicantsPage  = lazy(() => import("./pages/JobApplicantsPage"));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <Spinner size="lg" color="var(--accent)" />
    </div>
  );
}

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
  const { connect, disconnect, setMyId, seedNotifications } = useSocketStore();

  useFcmToken(!!(accessToken && user));

  useEffect(() => {
    if (accessToken) fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect / disconnect Socket.io based on auth state
  useEffect(() => {
    if (accessToken && user) {
      setMyId(user._id);
      connect(accessToken);
      api.get('/notifications').then(({ data }) => {
        seedNotifications(data.notifications, data.unreadCount);
      }).catch(() => {});
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
      <OnboardingGate />
      <AuthHydrator>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/collab" element={<CollabPage />} />
            <Route path="/collab/:postId/requests" element={<CollabRequestsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/project/:id" element={<WorkspacePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:jobId/applicants" element={<JobApplicantsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthHydrator>
    </BrowserRouter>
  );
}
