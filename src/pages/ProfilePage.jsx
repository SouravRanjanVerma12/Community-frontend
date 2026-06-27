import { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import FriendsList from "../components/friends/FriendsList";
import UserAbout from "../components/About/UserAbout";
import Project from "../components/Project/Project";
import PostCard from "../components/feed/PostCard";
import ImageCropper from "../components/ui/ImageCropper";
import { DOMAINS } from "../data/mockPosts";
import { useAuthStore } from "../stores/authStore";
import { useUserProfile, useUserPosts } from "../hooks/useProfile";
import { useThemeStore } from "../stores/themeStore";
import api from "../api/axiosInstance";
import { useSocketStore } from "../stores/socketStore";

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
const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/* ── upload blob then persist URL to user profile ── */
async function uploadBlob(blob, endpoint) {
  const fd = new FormData();
  fd.append("file", blob, "upload.jpg");
  const { data } = await api.post(`/upload/${endpoint}`, fd);
  const url = data.url;

  // persist the URL back to the user's profile
  const field = endpoint === "avatar" ? "avatarUrl" : "bannerUrl";
  await api.patch("/users/profile", { [field]: url });

  return url;
}

/* ── sub-components ── */
function StatPill({ value, label }) {
  return (
    <div style={{ textAlign: "center", padding: "0 16px", cursor: "pointer" }}>
      <span
        style={{
          display: "block",
          fontSize: "18px",
          fontWeight: "700",
          color: "var(--text-primary)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          display: "block",
          fontSize: "12px",
          color: "var(--text-muted)",
          marginTop: "1px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function SkillBadge({ label }) {
  return (
    <span
      style={{
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "500",
        background: "var(--accent-bg)",
        color: "var(--accent)",
        border: "1px solid var(--accent-border)",
      }}
    >
      {label}
    </span>
  );
}

const ALL_TABS = ["posts", "friends", "about", "projects", "settings"];
const TAB_LABELS = {
  posts: "Posts",
  friends: "Friends",
  about: "About",
  projects: "Projects",
  settings: "Settings",
};
const TAB_SOON = [""]; // Settings unlocked for own profile

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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch("/users/profile", { name, bio, location, website });
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
      desc: "Warm &amp; clean",
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
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </label>
        {opts.textarea ? (
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder={opts.placeholder}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              fontSize: "16px",
              color: "var(--text-primary)",
              lineHeight: "1.6",
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent-border)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
          />
        ) : (
          <input
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opts.placeholder}
            style={{
              padding: "10px 14px",
              minHeight: "44px",
              boxSizing: "border-box",
              borderRadius: "10px",
              border: "1.5px solid var(--border)",
              background: "var(--input-bg)",
              fontSize: "16px",
              color: "var(--text-primary)",
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent-border)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-dim)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginTop: "14px",
      }}
    >
      {/* Basic info */}
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "22px 24px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "18px",
          }}
        >
          Basic info
        </h3>
        <form
          onSubmit={handleSave}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
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
            <p style={{ fontSize: "13px", color: "var(--error-text)" }}>{error}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 22px",
                minHeight: "44px",
                boxSizing: "border-box",
                borderRadius: "9px",
                border: "none",
                background: saved ? "var(--success-bg)" : "var(--btn-grad)",
                color: saved ? "var(--success-text)" : "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.8 : 1,
                boxShadow: saved ? "none" : "var(--btn-grad-shadow)",
                transition: "background 0.2s, opacity 0.2s",
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="spin" /> Saving…
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
      <div
        style={{
          background: "var(--surface-1)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "22px 24px",
        }}
      >
        <h3
          style={{
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}
        >
          Appearance
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginBottom: "18px",
          }}
        >
          Choose how Prograstic looks to you.
        </p>

        <div
          className="theme-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {THEMES.map((t) => {
            const active = theme === t.value;
            return (
              <motion.button
                key={t.value}
                onClick={() => setTheme(t.value)}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: `2px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  background: "transparent",
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                  boxShadow: active ? "0 0 0 3px var(--accent-dim)" : "none",
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    height: "70px",
                    background: t.preview.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "48px",
                      borderRadius: "6px",
                      background: t.preview.surface,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div
                      style={{
                        height: "8px",
                        background: t.preview.accent,
                        borderRadius: "6px 6px 0 0",
                        opacity: 0.8,
                      }}
                    />
                    <div
                      style={{
                        margin: "4px 4px 2px",
                        height: "3px",
                        background: t.value === "dark" ? "#f0f2fc" : "#111827",
                        borderRadius: "2px",
                        opacity: 0.5,
                      }}
                    />
                    <div
                      style={{
                        margin: "0 4px",
                        height: "2px",
                        background: t.value === "dark" ? "#8b90b0" : "#4b5563",
                        borderRadius: "2px",
                        opacity: 0.4,
                      }}
                    />
                  </div>
                </div>
                {/* Label */}
                <div
                  style={{
                    padding: "8px 10px",
                    background: "var(--surface-2)",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: active ? "700" : "500",
                      color: active ? "var(--accent)" : "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {t.label}
                  </p>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    {t.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function ProfilePage() {
  const { userId } = useParams();
  const { user: me, accessToken, updateFollowing } = useAuthStore();

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
    Array.isArray(me?.following) && me.following.includes(userId);
  const [followLoading, setFollowLoading] = useState(false);

  const toggleFollowProfile = async () => {
    if (!me || followLoading) return;
    setFollowLoading(true);
    try {
      const { data } = await api.post(`/users/${userId}/follow`);
      updateFollowing(data.following);
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
      const url = await uploadBlob(blob, endpoint);
      setUrl(url);
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
      <div style={{ minHeight: "100svh", background: "var(--surface-0)" }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "80px 20px",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: "100svh", background: "var(--surface-0)" }}>
        <Navbar />
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--text-muted)",
          }}
        >
          <p
            style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}
          >
            User not found
          </p>
          <Link
            to="/explore"
            style={{ color: "var(--accent)", fontSize: "14px" }}
          >
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
    <div style={{ minHeight: "100svh", background: "var(--surface-0)" }}>
      <Navbar />

      {/* hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
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
        style={{ display: "none" }}
        onChange={(e) =>
          onFileChosen(e, {
            aspect: 1280 / 190,
            shape: "rect",
            label: "Banner",
            endpoint: "banner",
          })
        }
      />

      <div
        style={{ maxWidth: "780px", margin: "0 auto", padding: "0 16px 48px" }}
      >
        {/* ── Banner ── */}
        <div
          onClick={() => isOwnProfile && bannerInputRef.current?.click()}
          style={{
            height: "190px",
            borderRadius: "0 0 20px 20px",
            position: "relative",
            overflow: "hidden",
            background: bannerUrl
              ? `url(${bannerUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${dc}22 0%, ${dc}14 40%, var(--surface-0) 100%)`,
            cursor: isOwnProfile ? "pointer" : "default",
          }}
        >
          {!bannerUrl && (
            <>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `radial-gradient(circle, ${dc}22 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "20px",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: `${dc}60`,
                }}
              >
                {domainLabel(profile.domain)}
              </div>
            </>
          )}

          {/* banner upload hint (own profile) */}
          {isOwnProfile && (
            <div
              className="banner-overlay"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                color: "#fff",
                opacity: 0,
                transition: "opacity 0.2s, background 0.2s",
                background: "rgba(0,0,0,0)",
                pointerEvents: "none",
              }}
            >
              {uploadingBanner ? (
                <>
                  <Loader2 size={20} className="spin" />{" "}
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
                    Uploading…
                  </span>
                </>
              ) : (
                <>
                  <Camera size={18} />{" "}
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>
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
              style={{
                margin: "8px 0 0",
                padding: "10px 14px",
                borderRadius: "8px",
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                color: "var(--error-text)",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {uploadError}
              <button
                onClick={() => setUploadError("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--error-text)",
                  fontSize: "16px",
                  lineHeight: 1,
                }}
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
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "16px",
            padding: "0 24px 24px",
            marginTop: "-48px",
            position: "relative",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Avatar row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              paddingTop: "12px",
              marginBottom: "14px",
            }}
          >
            {/* Avatar */}
            <div
              onClick={() => isOwnProfile && avatarInputRef.current?.click()}
              style={{
                position: "relative",
                flexShrink: 0,
                width: "88px",
                height: "88px",
                marginTop: "-44px",
                cursor: isOwnProfile ? "pointer" : "default",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "4px solid var(--avatar-border)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    background: avatarColor(profile.name),
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: "700",
                    border: "4px solid var(--avatar-border)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                    userSelect: "none",
                  }}
                >
                  {initials(profile.name)}
                </div>
              )}

              {/* camera overlay */}
              {isOwnProfile && (
                <div
                  className="avatar-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "3px",
                    background: "rgba(0,0,0,0)",
                    color: "#fff",
                    opacity: 0,
                    transition: "opacity 0.18s, background 0.18s",
                    pointerEvents: "none",
                  }}
                >
                  {uploadingAvatar ? (
                    <Loader2 size={20} className="spin" />
                  ) : (
                    <>
                      <Camera size={16} />
                      <span style={{ fontSize: "10px", fontWeight: "700" }}>
                        Change
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              {isOwnProfile ? (
                <button
                  onClick={() => setActiveTab("settings")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "10px 16px",
                    minHeight: "44px",
                    boxSizing: "border-box",
                    borderRadius: "9px",
                    border: "1.5px solid var(--border)",
                    background: "transparent",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "border-color 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  <Edit3 size={14} /> Edit profile
                </button>
              ) : (
                <>
                  {/* Message and Unfriend buttons */}
                  {friendStatus.status === "accepted" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => navigate("/messages")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "9px",
                          border: "1.5px solid var(--border)",
                          background: "transparent",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                      <button
                        onClick={cancelRequest}
                        disabled={fsLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "9px",
                          border: "1.5px solid var(--error-border)",
                          background: "transparent",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "var(--error-text)",
                          cursor: "pointer",
                        }}
                      >
                        <UserMinus size={14} /> Unfriend
                      </button>
                    </div>
                  )}

                  {/* Friend request button */}
                  {friendStatus.status === "none" && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={sendFriendRequest}
                        disabled={fsLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "9px",
                          border: "none",
                          background: "var(--btn-grad)",
                          boxShadow: "var(--btn-grad-shadow)",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          opacity: fsLoading ? 0.7 : 1,
                        }}
                      >
                        <UserPlus size={14} /> Add Friend
                      </motion.button>
                      <button
                        onClick={toggleFollowProfile}
                        disabled={followLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "9px",
                          border: isFollowing
                            ? "1.5px solid var(--border)"
                            : "1.5px solid var(--accent)",
                          background: isFollowing
                            ? "transparent"
                            : "var(--btn-grad)",
                          boxShadow: isFollowing ? "none" : "var(--btn-grad-shadow)",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: isFollowing ? "var(--text-secondary)" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        {isFollowing ? (
                          <Check size={14} />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    </div>
                  )}

                  {friendStatus.status === "pending" &&
                    friendStatus.iAmRequester && (
                      <button
                        onClick={cancelRequest}
                        disabled={fsLoading}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "9px",
                          border: "1.5px solid var(--border)",
                          background: "transparent",
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                        }}
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
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "9px",
                          border: "none",
                          background: "var(--btn-grad)",
                          boxShadow: "var(--btn-grad-shadow)",
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        <UserCheck size={14} /> Accept Request
                      </motion.button>
                    )}

                  {friendStatus.status === "accepted" && (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "8px 14px",
                        borderRadius: "9px",
                        border: "1.5px solid #22c55e",
                        color: "#22c55e",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <UserCheck size={14} /> Friends
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
              marginBottom: "2px",
            }}
          >
            {profile.name}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginBottom: "10px",
            }}
          >
            @{profile.username || profile.email?.split("@")[0] || "user"}
          </p>

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              lineHeight: "1.65",
              marginBottom: "14px",
              maxWidth: "560px",
            }}
          >
            {profile.bio}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              marginBottom: "16px",
            }}
          >
            {profile.location && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                }}
              >
                <MapPin size={13} color="var(--text-muted)" />{" "}
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "13px",
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                <Globe size={13} /> {profile.website}
              </a>
            )}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <Calendar size={13} color="var(--text-muted)" /> Joined{" "}
              {profile.joinedYear}
            </span>
          </div>

          {profile.skills?.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "20px",
              }}
            >
              {profile.skills.map((s) => (
                <SkillBadge key={s} label={s} />
              ))}
            </div>
          )}

          <div
            style={{
              height: "1px",
              background: "var(--divider)",
              marginBottom: "20px",
            }}
          />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <StatPill value={userPosts.length} label="Posts" />
            <div
              style={{
                width: "1px",
                background: "var(--divider)",
                margin: "4px 0",
              }}
            />
            <StatPill value={fmtNum(followerCount)} label="Followers" />
            <div
              style={{
                width: "1px",
                background: "var(--divider)",
                margin: "4px 0",
              }}
            />
            <StatPill value={fmtNum(followingCount)} label="Following" />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            marginTop: "12px",
            display: "flex",
            overflow: "hidden",
          }}
        >
          {ALL_TABS.map((id) => {
            const active = activeTab === id;
            const isSoon = TAB_SOON.includes(id);
            const locked = isSoon || (id === "settings" && !isOwnProfile);
            return (
              <button
                key={id}
                onClick={() => !locked && setActiveTab(id)}
                style={{
                  flex: 1,
                  padding: "13px 8px",
                  border: "none",
                  borderBottom: active
                    ? "2px solid var(--accent)"
                    : "2px solid transparent",
                  background: active ? "var(--accent-dim)" : "transparent",
                  color: active
                    ? "var(--accent)"
                    : locked
                      ? "var(--text-muted)"
                      : "var(--text-secondary)",
                  fontSize: "13px",
                  fontWeight: active ? "700" : "500",
                  cursor: locked ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                  transition: "all 0.15s",
                }}
              >
                {TAB_LABELS[id]}
                {locked && (
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      fontWeight: "500",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
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

          {activeTab === "friends" && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ marginTop: "14px" }}
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
              style={{
                marginTop: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {userPosts.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px",
                  }}
                >
                  <Edit3
                    size={32}
                    style={{ marginBottom: "12px", opacity: 0.4, color: "var(--text-muted)" }}
                  />
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    No posts yet
                  </p>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                    Posts you share will appear here.
                  </p>
                </div>
              ) : (
                <>
                  {pinnedPost && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          marginBottom: "8px",
                          paddingLeft: "4px",
                        }}
                      >
                        <Pin
                          size={12}
                          style={{ color: "var(--text-muted)" }}
                        />
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "var(--text-muted)",
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          Pinned post
                        </span>
                      </div>
                      <PostCard post={pinnedPost} index={0} />
                    </div>
                  )}
                  <div style={{ paddingLeft: "4px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        /* banner hover */
        div:hover > .banner-overlay {
          opacity: 1 !important;
          background: rgba(0,0,0,0.38) !important;
        }
        /* avatar hover */
        div:hover > .avatar-overlay {
          opacity: 1 !important;
          background: rgba(0,0,0,0.48) !important;
        }

        button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .theme-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
