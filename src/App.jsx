import { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ConfirmDialogHost from "./components/ui/ConfirmDialog";
import OnboardingGate from "./components/onboarding/OnboardingGate";
import GlobalLoader from "./components/ui/GlobalLoader";
import NavProgressRunner from "./components/ui/NavProgressRunner";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { useSocketStore } from "./stores/socketStore";
import { useFcmToken } from "./hooks/useFcmToken";
import { useDeviceLocation } from "./hooks/useDeviceLocation";
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

function NavigationLoaders() {
  const location = useLocation();
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsFinished(false);
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsFinished(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <>
      <NavProgressRunner isFinished={isFinished} />
      <div
        className={`fixed inset-0 z-9998 flex items-center justify-center bg-bg/80 backdrop-blur-sm transition-opacity duration-400 ${isFinished ? 'opacity-0' : 'opacity-100'}`}
      >
        <GlobalLoader isFinished={isFinished} />
      </div>
    </>
  );
}

function RouteFallback() {
  return (
    <>
      <NavProgressRunner isFinished={false} />
      <div className="fixed inset-0 z-9998 flex items-center justify-center bg-bg/80 backdrop-blur-sm">
        <GlobalLoader isFinished={false} />
      </div>
    </>
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

function AuthHydrator({ children, onHydrated }) {
  const { accessToken, fetchMe, user } = useAuthStore();
  const { connect, disconnect, setMyId, seedNotifications } = useSocketStore();

  useFcmToken(!!(accessToken && user));
  useDeviceLocation(!!(accessToken && user));

  // Verify persisted token on first load; signal hydration complete when done
  useEffect(() => {
    if (accessToken) {
      fetchMe().finally(() => onHydrated?.());
    } else {
      onHydrated?.();
    }
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

/**
 * RequireAuth — wraps protected routes.
 * While hydrating (fetchMe pending): shows a spinner so we don't flash-redirect.
 * After hydration, if no accessToken: redirects to / (login page).
 */
function RequireAuth({ children, hydrated }) {
  const { accessToken } = useAuthStore();

  if (!hydrated) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [hydrated, setHydrated] = useState(false);

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
      <AuthHydrator onHydrated={() => setHydrated(true)}>
        <NavigationLoaders />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Protected routes — auto redirect to / if no token */}
            <Route path="/explore"                 element={<RequireAuth hydrated={hydrated}><ExplorePage /></RequireAuth>} />
            <Route path="/profile/:userId"         element={<RequireAuth hydrated={hydrated}><ProfilePage /></RequireAuth>} />
            <Route path="/collab"                  element={<RequireAuth hydrated={hydrated}><CollabPage /></RequireAuth>} />
            <Route path="/collab/:postId/requests" element={<RequireAuth hydrated={hydrated}><CollabRequestsPage /></RequireAuth>} />
            <Route path="/messages"                element={<RequireAuth hydrated={hydrated}><MessagesPage /></RequireAuth>} />
            <Route path="/project/:id"             element={<RequireAuth hydrated={hydrated}><WorkspacePage /></RequireAuth>} />
            <Route path="/jobs"                    element={<RequireAuth hydrated={hydrated}><JobsPage /></RequireAuth>} />
            <Route path="/jobs/:jobId/applicants"  element={<RequireAuth hydrated={hydrated}><JobApplicantsPage /></RequireAuth>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthHydrator>
    </BrowserRouter>
  );
}
