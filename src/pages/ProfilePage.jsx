import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Globe,
  Calendar,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageSquare,
  Lock,
  Edit3,
  Camera,
  Loader2,
  Clock,
  Check,
  Pin,
  BarChart3,
  Bookmark,
} from "lucide-react";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import Navbar from "../components/layout/Navbar";
import FriendsList from "../components/friends/FriendsList";
import UserAbout from "../components/About/UserAbout";
import Project from "../components/Project/Project";
import PostCard from "../components/feed/PostCard";
import ImageCropper from "../components/ui/ImageCropper";
import { DOMAINS } from "../data/mockPosts";
import { useAuthStore } from "../stores/authStore";
import { useUserProfile, useUserPosts } from "../hooks/useProfile";
import { useBookmarkedPosts } from "../hooks/usePosts";
import { useThemeStore } from "../stores/themeStore";
import api from "../api/axiosInstance";

/* ── helpers ── */
const avatarColor = (name) =>
  `hsl(${[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`;
const initials = (name) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
const domainColor = (key) =>
  DOMAINS.find((d) => d.value === key)?.color ?? "#ff5c35";
const domainLabel = (key) => DOMAINS.find((d) => d.value === key)?.label ?? key;

/* ── upload blob then persist URL to user profile ── */
async function uploadBlob(blob, endpoint) {
  const fd = new FormData();
  fd.append("file", blob, "upload.jpg");
  const { data: uploadData } = await api.post(`/upload/${endpoint}`, fd);
  const url = uploadData.url;

  // persist the URL back to the user's profile
  const field = endpoint === "avatar" ? "avatarUrl" : "bannerUrl";
  const { data: profileData } = await api.patch("/users/profile", { [field]: url });

  return { url, user: profileData.user };
}

/* ── sub-components ── */
function StatPill({ value, label }) {
  return (
    <div className="text-center px-4 cursor-pointer">
      <span className="block text-lg font-bold text-text-primary">
        {value}
      </span>
      <span className="block text-xs text-text-muted mt-0.5">
        {label}
      </span>
    </div>
  );
}

function SkillBadge({ label }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent-bg text-accent border border-accent-border">
      {label}
    </span>
  );
}

const ALL_TABS = ["posts", "friends", "about", "projects", "settings"];
const OWN_PROFILE_TABS = ["posts", "stats", "bookmarks", "friends", "about", "projects", "settings"];
const TAB_LABELS = {
  posts: "Posts",
  stats: "Stats",
  bookmarks: "Saved",
  friends: "Friends",
  about: "About",
  projects: "Projects",
  settings: "Settings",
};
const TAB_SOON = [""]; // Settings unlocked for own profile

/* ── Stats panel ── */
const TYPE_COLORS = { text: '#1e9df1', code: '#8b5cf6', video: '#ec4899', collab: '#6366f1' };
const TYPE_LABELS = { text: 'Text', code: 'Code', video: 'Video', collab: 'Collab' };

function lastSixMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short' }) };
  });
}

function StatsPanel({ posts, followerCount }) {
  const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);

  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentCount || 0), 0);

  const typeCounts = posts.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  const typeSlices = Object.entries(typeCounts).map(([type, value]) => ({
    id: type,
    label: TYPE_LABELS[type] ?? type,
    value,
    color: TYPE_COLORS[type] ?? '#6b7280',
  }));

  const months = lastSixMonths();
  const monthCounts = months.map(({ year, month }) =>
    posts.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3.5 flex flex-col gap-3.5"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Posts', value: posts.length },
          { label: 'Likes received', value: fmtNum(totalLikes) },
          { label: 'Comments received', value: fmtNum(totalComments) },
          { label: 'Followers', value: fmtNum(followerCount) },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl px-4 py-3.5">
            <p className="m-0 text-2xl font-extrabold text-text-primary">{s.value}</p>
            <p className="m-0 text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="bg-card border border-card-border rounded-xl px-4 py-10 text-center">
          <BarChart3 size={28} color="var(--text-faint)" className="mx-auto mb-2" />
          <p className="text-sm text-text-muted m-0">No posts yet — stats will show up once you start posting.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3.5">
          {/* Posts by type */}
          <div className="bg-card border border-card-border rounded-xl px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-muted mb-2.5">
              Posts by type
            </p>
            <div className="flex flex-col items-center gap-3">
              <PieChart
                series={[{ data: typeSlices, innerRadius: 32, outerRadius: 60, paddingAngle: 2, cornerRadius: 3 }]}
                width={160}
                height={160}
                slotProps={{ legend: { hidden: true } }}
                tooltip={{ trigger: 'item' }}
              />
              <div className="flex flex-col gap-1.5 w-full">
                {typeSlices.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-text-secondary flex-1">{s.label}</span>
                    <span className="text-xs font-semibold text-text-primary">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Posts over time */}
          <div className="bg-card border border-card-border rounded-xl px-4 py-3.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-text-muted mb-2.5">
              Posts over the last 6 months
            </p>
            <BarChart
              xAxis={[{ data: months.map((m) => m.label), scaleType: 'band' }]}
              series={[{ data: monthCounts, color: '#1e9df1' }]}
              width={280}
              height={200}
              slotProps={{ legend: { hidden: true } }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Bookmarks panel ── */
function BookmarksPanel() {
  const { data: posts = [], isLoading } = useBookmarkedPosts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-3.5 flex flex-col gap-3"
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} color="var(--text-muted)" className="animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center px-5 py-15 bg-card border border-card-border rounded-2xl">
          <Bookmark size={32} className="mb-3 opacity-40 text-text-muted mx-auto" />
          <p className="text-base font-semibold text-text-primary mb-1.5">
            No saved posts yet
          </p>
          <p className="text-sm text-text-muted">
            Tap the bookmark icon on any post to add it to your saved posts.
          </p>
        </div>
      ) : (
        posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)
      )}
    </motion.div>
  );
}

/* ── Settings panel ── */
function SettingsPanel({ profile }) {
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [website, setWebsite] = useState(profile?.website ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { theme, setTheme } = useThemeStore();

  const setUser = useAuthStore((s) => s.setUser);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.patch("/users/profile", { name, bio, location, website });
      setUser(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const THEMES = [
    {
      value: "light",
      label: "Light",
      desc: "Warm & clean",
      preview: { bg: "#f6f3ee", surface: "#fff", accent: "#ff5c35" },
    },
    {
      value: "dark",
      label: "Dark",
      desc: "Easy on eyes",
      preview: { bg: "#0d0f18", surface: "#13151f", accent: "#e8eaf0" },
    },
    {
      value: "system",
      label: "System",
      desc: "Follows OS",
      preview: {
        bg: "linear-gradient(135deg,#f6f3ee 50%,#0d0f18 50%)",
        surface: "#888",
        accent: "#ff5c35",
      },
    },
  ];

  const field = (label, value, onChange, opts = {}) => {
    const inputId = `profile-field-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
        {opts.textarea ? (
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={opts.placeholder}
            className="px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-border bg-input text-base text-text-primary leading-relaxed resize-y outline-none font-[inherit] transition-[border-color,box-shadow] duration-150 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-dim)]"
          />
        ) : (
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opts.placeholder}
            className="px-3.5 py-2.5 min-h-11 box-border rounded-[10px] border-[1.5px] border-border bg-input text-base text-text-primary outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-dim)]"
          />
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-4 mt-3.5"
    >
      {/* Basic info */}
      <div className="bg-surface-1 border border-border rounded-2xl px-6 py-5.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-4.5">
          Basic info
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-3.5">
          {field("Display name", name, setName, { placeholder: "Your name" })}
          {field("Bio", bio, setBio, {
            placeholder: "Tell the community about yourself…",
            textarea: true,
          })}
          {field("Location", location, setLocation, {
            placeholder: "City, Country",
          })}
          {field("Website", website, setWebsite, {
            placeholder: "https://yoursite.com",
          })}

          {error && (
            <p className="text-[13px] text-error">{error}</p>
          )}

          <div className="flex items-center gap-2.5">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              className={[
                'flex items-center justify-center gap-1.5 px-5.5 py-2.5 min-h-11 box-border rounded-[9px] border-none text-sm font-semibold transition-[background-color,opacity] duration-200',
                saved ? 'bg-success-bg text-success' : 'bg-(image:--btn-grad) text-white shadow-btn',
                saving ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
              ].join(' ')}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : saved ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                "Save changes"
              )}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Appearance */}
      <div className="bg-surface-1 border border-border rounded-2xl px-6 py-5.5">
        <h3 className="text-[15px] font-bold text-text-primary mb-1.5">
          Appearance
        </h3>
        <p className="text-[13px] text-text-muted mb-4.5">
          Choose how Prograstic looks to you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const active = theme === t.value;
            return (
              <motion.button
                key={t.value}
                onClick={() => setTheme(t.value)}
                whileTap={{ scale: 0.97 }}
                className="p-0 rounded-xl cursor-pointer bg-transparent overflow-hidden transition-colors duration-150"
                style={{
                  border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: active ? "0 0 0 3px var(--accent-dim)" : "none",
                }}
              >
                {/* Preview */}
                <div className="h-[70px] flex items-center justify-center gap-1.5 p-2.5" style={{ background: t.preview.bg }}>
                  <div className="w-8 h-12 rounded-md shadow-[0_2px_6px_rgba(0,0,0,0.15)]" style={{ background: t.preview.surface }}>
                    <div className="h-2 rounded-t-md opacity-80" style={{ background: t.preview.accent }} />
                    <div
                      className="mx-1 mt-1 mb-0.5 h-[3px] rounded-sm opacity-50"
                      style={{ background: t.value === "dark" ? "#f0f2fc" : "#111827" }}
                    />
                    <div
                      className="mx-1 h-0.5 rounded-sm opacity-40"
                      style={{ background: t.value === "dark" ? "#8b90b0" : "#4b5563" }}
                    />
                  </div>
                </div>
                {/* Label */}
                <div className="px-2.5 py-2 bg-surface-2 text-left">
                  <p className={`text-[13px] m-0 ${active ? 'font-bold text-accent' : 'font-medium text-text-primary'}`}>
                    {t.label}
                  </p>
                  <p className="text-[11px] text-text-muted m-0">
                    {t.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Security */}
      {profile?.authProvider === 'linkedin' && (
        <div className="bg-surface-1 border border-border rounded-2xl px-6 py-5.5">
          <h3 className="text-[15px] font-bold text-text-primary mb-1.5 flex items-center gap-2">
            <Lock size={16} className="text-text-muted" /> Security
          </h3>
          <p className="text-[13px] text-text-muted mb-4.5">
            Since you signed up with LinkedIn, you can set a password to log in with your email address.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const password = fd.get('password');
              const confirmPassword = fd.get('confirmPassword');
              if (password.length < 6) {
                alert('Password must be at least 6 characters.');
                return;
              }
              if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
              }
              try {
                await api.post('/auth/set-password', { password });
                alert('Password set successfully!');
                e.target.reset();
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to set password');
              }
            }}
            className="flex flex-col gap-3.5 max-w-[400px]"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">New Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                className="px-3.5 py-2.5 min-h-11 box-border rounded-[10px] border-[1.5px] border-border bg-input text-base text-text-primary outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-dim)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter your password"
                className="px-3.5 py-2.5 min-h-11 box-border rounded-[10px] border-[1.5px] border-border bg-input text-base text-text-primary outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-dim)]"
              />
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center px-5.5 py-2.5 min-h-11 box-border rounded-[9px] border-none bg-(image:--btn-grad) text-white shadow-btn text-sm font-semibold cursor-pointer transition-[opacity] duration-200 hover:opacity-90"
              >
                Set password
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function ProfilePage() {
  const { userId } = useParams();
  const { user: me, updateFollowing, setUser } = useAuthStore();

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  /* crop modal state */
  const [cropConfig, setCropConfig] = useState(null);
  // cropConfig = { file, aspect, shape, label, endpoint }

  /* final uploaded URLs */
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  const isOwnProfile = me?._id === userId;

  // For own profile use the store (already hydrated), for others fetch from API
  const { data: fetchedProfile, isLoading: profileLoading } = useUserProfile(
    isOwnProfile ? null : userId,
  );

  const profile = isOwnProfile ? me : fetchedProfile;

  // Sync from API once profile is available
  useEffect(() => {
    setAvatarUrl(profile?.avatarUrl || null);
    setBannerUrl(profile?.bannerUrl || null);
  }, [profile?.avatarUrl, profile?.bannerUrl]);

  /* uploading spinners */
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  // Friend request state for other profiles
  const [friendStatus, setFriendStatus] = useState({ status: "none" }); // none|pending|accepted
  const [fsLoading, setFsLoading] = useState(false);

  const { data: userPosts = [], isLoading: postsLoading } =
    useUserPosts(userId);

  // Load friend status when viewing another user's profile
  useEffect(() => {
    if (isOwnProfile || !me) return;
    api
      .get(`/friends/status/${userId}`)
      .then(({ data }) => setFriendStatus(data))
      .catch(() => {});
  }, [userId, isOwnProfile, me]);

  const isFollowing =
    Array.isArray(me?.following) && me.following.some((id) => String(id) === String(userId));
  const [followLoading, setFollowLoading] = useState(false);

  const toggleFollowProfile = async () => {
    if (!me || followLoading) return;
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/users/${userId}/follow`);
      updateFollowing(data.following);
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
    } catch {
      /* ignore */
    } finally {
      setFollowLoading(false);
    }
  };

  /* ── file chosen → open cropper ── */
  const onFileChosen = (e, config) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropConfig({ file, ...config });
    e.target.value = "";
  };

  /* ── crop confirmed → upload ── */
  const onCropComplete = async (blob) => {
    const { endpoint } = cropConfig;
    setCropConfig(null);
    setUploadError("");

    const setUploading =
      endpoint === "avatar" ? setUploadingAvatar : setUploadingBanner;
    const setUrl = endpoint === "avatar" ? setAvatarUrl : setBannerUrl;

    setUploading(true);
    try {
      const { url, user: updatedUser } = await uploadBlob(blob, endpoint);
      setUrl(url);
      setUser(updatedUser);
    } catch {
      setUploadError(
        `${endpoint === "avatar" ? "Profile photo" : "Banner"} upload failed. Please try again.`,
      );
    } finally {
      setUploading(false);
    }
  };

  const isLoading = profileLoading || postsLoading;

  if (isLoading && !profile) {
    return (
      <div className="min-h-svh bg-surface-0">
        <Navbar />
        <div className="flex justify-center px-5 py-20">
          <div className="w-7 h-7 rounded-full border-[3px] border-border border-t-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-svh bg-surface-0">
        <Navbar />
        <div className="text-center px-5 py-20 text-text-muted">
          <p className="text-lg font-semibold mb-2">
            User not found
          </p>
          <Link to="/explore" className="text-accent text-sm">
            ← Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const pinnedPost = [...userPosts].sort(
    (a, b) => b.likeCount - a.likeCount,
  )[0];
  const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : n);
  const followerCount = Array.isArray(profile.followers)
    ? profile.followers.length
    : (profile.followers ?? 0);
  const followingCount = Array.isArray(profile.following)
    ? profile.following.length
    : (profile.following ?? 0);
  const dc = domainColor(profile.domain ?? "webdev");

  // Friend request actions
  const sendFriendRequest = async () => {
    setFsLoading(true);
    try {
      const { data } = await api.post(`/friends/request/${userId}`);
      setFriendStatus({
        status: "pending",
        iAmRequester: true,
        id: data.friendship._id,
      });
    } finally {
      setFsLoading(false);
    }
  };

  const cancelRequest = async () => {
    if (!friendStatus.id) return;
    setFsLoading(true);
    try {
      await api.delete(`/friends/${friendStatus.id}`);
      setFriendStatus({ status: "none" });
    } finally {
      setFsLoading(false);
    }
  };

  const acceptRequest = async () => {
    if (!friendStatus.id) return;
    setFsLoading(true);
    try {
      await api.post(`/friends/accept/${friendStatus.id}`);
      setFriendStatus((s) => ({ ...s, status: "accepted" }));
    } finally {
      setFsLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-surface-0">
      <Navbar />

      {/* hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onFileChosen(e, {
            aspect: 1,
            shape: "round",
            label: "Profile Photo",
            endpoint: "avatar",
          })
        }
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onFileChosen(e, {
            aspect: 1280 / 190,
            shape: "rect",
            label: "Banner",
            endpoint: "banner",
          })
        }
      />

      <div className="max-w-[780px] mx-auto px-4 pb-12">
        {/* ── Banner ── */}
        <div
          onClick={() => isOwnProfile && bannerInputRef.current?.click()}
          className={`group h-[190px] rounded-b-[20px] relative overflow-hidden ${isOwnProfile ? 'cursor-pointer' : 'cursor-default'}`}
          style={{
            background: bannerUrl
              ? `url(${bannerUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${dc}22 0%, ${dc}14 40%, var(--surface-0) 100%)`,
          }}
        >
          {!bannerUrl && (
            <>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(circle, ${dc}22 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
              />
              <div
                className="absolute bottom-4 right-5 text-[11px] font-bold tracking-widest uppercase"
                style={{ color: `${dc}60` }}
              >
                {domainLabel(profile.domain)}
              </div>
            </>
          )}

          {/* banner upload hint (own profile) */}
          {isOwnProfile && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-white opacity-0 bg-black/0 transition-[opacity,background-color] duration-200 pointer-events-none group-hover:opacity-100 group-hover:bg-black/38">
              {uploadingBanner ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-[13px] font-semibold">
                    Uploading…
                  </span>
                </>
              ) : (
                <>
                  <Camera size={18} />
                  <span className="text-[13px] font-semibold">
                    Change banner
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* error toast */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 px-3.5 py-2.5 rounded-lg bg-error-bg border border-error-border text-error text-[13px] flex items-center justify-between"
            >
              {uploadError}
              <button
                onClick={() => setUploadError("")}
                className="bg-none border-none cursor-pointer text-error text-base leading-none"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card border border-card-border rounded-2xl px-6 pb-6 -mt-12 relative shadow-card"
        >
          {/* Avatar row */}
          <div className="flex items-end justify-between pt-3 mb-3.5">
            {/* Avatar */}
            <div
              onClick={() => isOwnProfile && avatarInputRef.current?.click()}
              className={`group relative shrink-0 w-22 h-22 -mt-11 ${isOwnProfile ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-22 h-22 rounded-full object-cover border-4 border-avatar-border shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                />
              ) : (
                <div
                  className="w-22 h-22 rounded-full text-white flex items-center justify-center text-[32px] font-bold border-4 border-avatar-border shadow-[0_2px_12px_rgba(0,0,0,0.12)] select-none"
                  style={{ background: avatarColor(profile.name) }}
                >
                  {initials(profile.name)}
                </div>
              )}

              {/* camera overlay */}
              {isOwnProfile && (
                <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-[3px] bg-black/0 text-white opacity-0 transition-[opacity,background-color] duration-180 pointer-events-none group-hover:opacity-100 group-hover:bg-black/48">
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={16} />
                      <span className="text-[10px] font-bold">
                        Change
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setActiveTab("settings")}
                  className="flex items-center gap-1.5 px-4 py-2.5 min-h-11 box-border rounded-[9px] border-[1.5px] border-border bg-transparent text-sm font-semibold text-text-secondary cursor-pointer transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  <Edit3 size={14} /> Edit profile
                </button>
              ) : (
                <>
                  {/* Message and Unfriend buttons */}
                  {friendStatus.status === "accepted" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate("/messages")}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] border-[1.5px] border-border bg-transparent text-[13px] font-medium text-text-secondary cursor-pointer"
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                      <button
                        onClick={cancelRequest}
                        disabled={fsLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] border-[1.5px] border-error-border bg-transparent text-[13px] font-medium text-error cursor-pointer"
                      >
                        <UserMinus size={14} /> Unfriend
                      </button>
                    </div>
                  )}

                  {/* Friend request button */}
                  {friendStatus.status === "none" && (
                    <div className="flex gap-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={sendFriendRequest}
                        disabled={fsLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-none bg-(image:--btn-grad) shadow-btn text-white text-[13px] font-semibold cursor-pointer transition-opacity duration-150"
                        style={{ opacity: fsLoading ? 0.7 : 1 }}
                      >
                        <UserPlus size={14} /> Add Friend
                      </motion.button>
                      <button
                        onClick={toggleFollowProfile}
                        disabled={followLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-[9px] text-[13px] font-medium cursor-pointer"
                        style={{
                          border: isFollowing ? "1.5px solid var(--border)" : "1.5px solid var(--accent)",
                          background: isFollowing ? "transparent" : "var(--btn-grad)",
                          boxShadow: isFollowing ? "none" : "var(--btn-grad-shadow)",
                          color: isFollowing ? "var(--text-secondary)" : "#fff",
                        }}
                      >
                        {isFollowing ? <Check size={14} /> : <UserPlus size={14} />}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  )}

                  {friendStatus.status === "pending" &&
                    friendStatus.iAmRequester && (
                      <button
                        onClick={cancelRequest}
                        disabled={fsLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-[1.5px] border-border bg-transparent text-[13px] font-medium text-text-muted cursor-pointer"
                      >
                        <Clock size={14} /> Pending
                      </button>
                    )}

                  {friendStatus.status === "pending" &&
                    !friendStatus.iAmRequester && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={acceptRequest}
                        disabled={fsLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] border-none bg-(image:--btn-grad) shadow-btn text-white text-[13px] font-semibold cursor-pointer"
                      >
                        <UserCheck size={14} /> Accept Request
                      </motion.button>
                    )}

                  {friendStatus.status === "accepted" && (
                    <span className="flex items-center gap-[5px] px-3.5 py-2 rounded-[9px] border-[1.5px] border-[#22c55e] text-[#22c55e] text-[13px] font-semibold">
                      <UserCheck size={14} /> Friends
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <h1 className="text-[22px] font-extrabold text-text-primary tracking-[-0.5px] mb-0.5">
            {profile.name}
          </h1>
          <p className="text-sm text-text-muted mb-2.5">
            @{profile.username || profile.email?.split("@")[0] || "user"}
          </p>

          <p className="text-sm text-text-secondary leading-[1.65] mb-3.5 max-w-[560px]">
            {profile.bio}
          </p>

          <div className="flex flex-wrap gap-3.5 mb-4">
            {profile.location && (
              <span className="flex items-center gap-1 text-[13px] text-text-secondary">
                <MapPin size={13} color="var(--text-muted)" /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-1 text-[13px] text-accent no-underline"
              >
                <Globe size={13} /> {profile.website}
              </a>
            )}
            <span className="flex items-center gap-1 text-[13px] text-text-secondary">
              <Calendar size={13} color="var(--text-muted)" /> Joined {profile.createdAt ? new Date(profile.createdAt).getFullYear() : ''}
            </span>
          </div>

          {profile.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {profile.skills.map((s) => (
                <SkillBadge key={s} label={s} />
              ))}
            </div>
          )}

          <div className="h-px bg-divider mb-5" />

          <div className="flex justify-center">
            <StatPill value={userPosts.length} label="Posts" />
            <div className="w-px bg-divider my-1" />
            <StatPill value={fmtNum(followerCount)} label="Followers" />
            <div className="w-px bg-divider my-1" />
            <StatPill value={fmtNum(followingCount)} label="Following" />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div className="bg-surface-1 border border-border rounded-xl mt-3 flex overflow-x-auto scrollbar-none">
          {(isOwnProfile ? OWN_PROFILE_TABS : ALL_TABS).map((id) => {
            const active = activeTab === id;
            const isSoon = TAB_SOON.includes(id);
            const locked = isSoon || (id === "settings" && !isOwnProfile);
            return (
              <button
                key={id}
                onClick={() => !locked && setActiveTab(id)}
                className={[
                  'flex-1 shrink-0 px-3 sm:px-2 py-3.5 border-none border-b-2 text-[13px] flex items-center justify-center gap-1.5 transition-all duration-150 whitespace-nowrap',
                  active ? 'font-bold' : 'font-medium',
                  locked ? 'cursor-default' : 'cursor-pointer',
                ].join(' ')}
                style={{
                  borderBottomColor: active ? 'var(--accent)' : 'transparent',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : locked ? 'var(--text-muted)' : 'var(--text-secondary)',
                }}
              >
                {TAB_LABELS[id]}
                {locked && (
                  <span className="text-[10px] px-1.5 py-px rounded bg-surface-2 text-text-muted font-medium inline-flex items-center gap-0.5">
                    <Lock size={9} /> Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "settings" && isOwnProfile && (
            <SettingsPanel key="settings" profile={profile} />
          )}

          {activeTab === "stats" && isOwnProfile && (
            <StatsPanel key="stats" posts={userPosts} followerCount={followerCount} />
          )}

          {activeTab === "bookmarks" && isOwnProfile && (
            <BookmarksPanel key="bookmarks" />
          )}

          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3.5"
            >
              <FriendsList userId={userId} isOwnProfile={isOwnProfile} />
            </motion.div>
          )}

          {activeTab === "about" && (
            <UserAbout profile={profile} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "projects" && (
            <Project userId={userId} isOwnProfile={isOwnProfile} />
          )}

          {activeTab === "posts" && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3.5 flex flex-col gap-3"
            >
              {userPosts.length === 0 ? (
                <div className="text-center px-5 py-15 bg-card border border-card-border rounded-2xl">
                  <Edit3 size={32} className="mb-3 opacity-40 text-text-muted" />
                  <p className="text-base font-semibold text-text-primary mb-1.5">
                    No posts yet
                  </p>
                  <p className="text-sm text-text-muted">
                    Posts you share will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {pinnedPost && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2 pl-1">
                        <Pin size={12} className="text-text-muted" />
                        <span className="text-xs font-semibold text-text-muted tracking-wide uppercase">
                          Pinned post
                        </span>
                      </div>
                      <PostCard post={pinnedPost} index={0} />
                    </div>
                  )}
                  <div className="pl-1">
                    <span className="text-xs font-semibold text-text-muted tracking-wide uppercase">
                      All posts
                    </span>
                  </div>
                  {userPosts.map((post, i) => (
                    <PostCard key={post._id} post={post} index={i} />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Crop modal ── */}
      <AnimatePresence>
        {cropConfig && (
          <ImageCropper
            file={cropConfig.file}
            aspect={cropConfig.aspect}
            shape={cropConfig.shape}
            label={cropConfig.label}
            onComplete={onCropComplete}
            onCancel={() => setCropConfig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
