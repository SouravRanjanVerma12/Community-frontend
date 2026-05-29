import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Globe, Calendar, UserPlus, UserCheck,
  MessageSquare, Lock, Edit3, Camera, Loader2,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import PostCard from '../components/feed/PostCard';
import ImageCropper from '../components/ui/ImageCropper';
import { DOMAINS } from '../data/mockPosts';
import { useAuthStore } from '../stores/authStore';
import { useUserProfile, useUserPosts } from '../hooks/useProfile';
import api from '../api/axiosInstance';

/* ── helpers ── */
const avatarColor = (name) =>
  `hsl(${[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360},55%,55%)`;
const initials = (name) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
const domainColor = (key) => DOMAINS.find((d) => d.value === key)?.color ?? '#7c3aed';
const domainLabel = (key) => DOMAINS.find((d) => d.value === key)?.label ?? key;
const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

/* ── upload blob then persist URL to user profile ── */
async function uploadBlob(blob, endpoint) {
  const fd = new FormData();
  fd.append('file', blob, 'upload.jpg');
  const { data } = await api.post(`/upload/${endpoint}`, fd);
  const url = data.url;

  // persist the URL back to the user's profile
  const field = endpoint === 'avatar' ? 'avatarUrl' : 'bannerUrl';
  await api.patch('/users/profile', { [field]: url });

  return url;
}

/* ── sub-components ── */
function StatPill({ value, label }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 16px', cursor: 'pointer' }}>
      <span style={{ display: 'block', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
        {value}
      </span>
      <span style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginTop: '1px' }}>
        {label}
      </span>
    </div>
  );
}

function SkillBadge({ label }) {
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
      background: 'rgba(124,58,237,0.08)', color: '#7c3aed',
      border: '1px solid rgba(124,58,237,0.18)',
    }}>
      {label}
    </span>
  );
}

const TABS = [
  { id: 'posts',    label: 'Posts',    available: true  },
  { id: 'about',    label: 'About',    available: false },
  { id: 'projects', label: 'Projects', available: false },
  { id: 'settings', label: 'Settings', available: false },
];

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function ProfilePage() {
  const { userId }    = useParams();
  const { user: me, accessToken } = useAuthStore();

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  /* crop modal state */
  const [cropConfig, setCropConfig] = useState(null);
  // cropConfig = { file, aspect, shape, label, endpoint }

  /* final uploaded URLs */
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  // Sync from API once fetchMe resolves (me starts null, updates asynchronously)
  useEffect(() => {
    if (me?.avatarUrl) setAvatarUrl(me.avatarUrl);
    if (me?.bannerUrl) setBannerUrl(me.bannerUrl);
  }, [me?.avatarUrl, me?.bannerUrl]);

  /* uploading spinners */
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError,     setUploadError]     = useState('');

  const [activeTab, setActiveTab] = useState('posts');
  const [following, setFollowing] = useState(false);

  const isOwnProfile = me?._id === userId;

  // For own profile use the store (already hydrated), for others fetch from API
  const { data: fetchedProfile, isLoading: profileLoading } = useUserProfile(
    isOwnProfile ? null : userId
  );
  const { data: userPosts = [], isLoading: postsLoading } = useUserPosts(userId);

  const profile = isOwnProfile ? me : fetchedProfile;

  /* ── file chosen → open cropper ── */
  const onFileChosen = (e, config) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropConfig({ file, ...config });
    e.target.value = '';
  };

  /* ── crop confirmed → upload ── */
  const onCropComplete = async (blob) => {
    const { endpoint } = cropConfig;
    setCropConfig(null);
    setUploadError('');

    const setUploading = endpoint === 'avatar' ? setUploadingAvatar : setUploadingBanner;
    const setUrl       = endpoint === 'avatar' ? setAvatarUrl       : setBannerUrl;

    setUploading(true);
    try {
      const url = await uploadBlob(blob, endpoint);
      setUrl(url);
    } catch {
      setUploadError(`${endpoint === 'avatar' ? 'Profile photo' : 'Banner'} upload failed. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const isLoading = profileLoading || postsLoading;

  if (isLoading && !profile) {
    return (
      <div style={{ minHeight: '100svh', background: '#f8f9fb' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #e4e7ec', borderTopColor: '#7c3aed', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100svh', background: '#f8f9fb' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>User not found</p>
          <Link to="/explore" style={{ color: '#7c3aed', fontSize: '14px' }}>← Back to Explore</Link>
        </div>
      </div>
    );
  }

  const pinnedPost    = [...userPosts].sort((a, b) => b.likeCount - a.likeCount)[0];
  const dc            = domainColor(profile.domain ?? 'webdev');
  const followerCount = (profile.followers ?? 0) + (following ? 1 : 0);

  return (
    <div style={{ minHeight: '100svh', background: '#f8f9fb' }}>
      <Navbar />

      {/* hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onFileChosen(e, { aspect: 1, shape: 'round', label: 'Profile Photo', endpoint: 'avatar' })}
      />
      <input
        ref={bannerInputRef}
        type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onFileChosen(e, { aspect: 1280 / 190, shape: 'rect', label: 'Banner', endpoint: 'banner' })}
      />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 16px 48px' }}>

        {/* ── Banner ── */}
        <div
          onClick={() => isOwnProfile && bannerInputRef.current?.click()}
          style={{
            height: '190px', borderRadius: '0 0 20px 20px',
            position: 'relative', overflow: 'hidden',
            background: bannerUrl
              ? `url(${bannerUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, ${dc}22 0%, ${dc}14 40%, #f5f3ff 100%)`,
            cursor: isOwnProfile ? 'pointer' : 'default',
          }}
        >
          {!bannerUrl && (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, ${dc}22 1px, transparent 1px)`,
                backgroundSize: '24px 24px', pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute', bottom: '16px', right: '20px',
                fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                textTransform: 'uppercase', color: `${dc}60`,
              }}>
                {domainLabel(profile.domain)}
              </div>
            </>
          )}

          {/* banner upload hint (own profile) */}
          {isOwnProfile && (
            <div className="banner-overlay" style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: '#fff', opacity: 0, transition: 'opacity 0.2s, background 0.2s',
              background: 'rgba(0,0,0,0)',
              pointerEvents: 'none',
            }}>
              {uploadingBanner
                ? <><Loader2 size={20} className="spin" /> <span style={{ fontSize: '13px', fontWeight: '600' }}>Uploading…</span></>
                : <><Camera size={18} /> <span style={{ fontSize: '13px', fontWeight: '600' }}>Change banner</span></>}
            </div>
          )}
        </div>

        {/* error toast */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                margin: '8px 0 0', padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              {uploadError}
              <button onClick={() => setUploadError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '16px', lineHeight: 1 }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#fff', border: '1px solid #e4e7ec',
            borderRadius: '16px', padding: '0 24px 24px',
            marginTop: '-48px', position: 'relative',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: '12px', marginBottom: '14px' }}>

            {/* Avatar */}
            <div
              onClick={() => isOwnProfile && avatarInputRef.current?.click()}
              style={{
                position: 'relative', flexShrink: 0,
                width: '88px', height: '88px', marginTop: '-44px',
                cursor: isOwnProfile ? 'pointer' : 'default',
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl} alt={profile.name}
                  style={{
                    width: '88px', height: '88px', borderRadius: '50%',
                    objectFit: 'cover', border: '4px solid #fff',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  }}
                />
              ) : (
                <div style={{
                  width: '88px', height: '88px', borderRadius: '50%',
                  background: avatarColor(profile.name), color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', fontWeight: '700',
                  border: '4px solid #fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                  userSelect: 'none',
                }}>
                  {initials(profile.name)}
                </div>
              )}

              {/* camera overlay */}
              {isOwnProfile && (
                <div className="avatar-overlay" style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '3px',
                  background: 'rgba(0,0,0,0)', color: '#fff',
                  opacity: 0, transition: 'opacity 0.18s, background 0.18s',
                  pointerEvents: 'none',
                }}>
                  {uploadingAvatar
                    ? <Loader2 size={20} className="spin" />
                    : <><Camera size={16} /><span style={{ fontSize: '10px', fontWeight: '700' }}>Change</span></>}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {isOwnProfile ? (
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '9px',
                  border: '1.5px solid #e4e7ec', background: 'transparent',
                  fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer',
                }}>
                  <Edit3 size={14} /> Edit profile
                </button>
              ) : (
                <>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '9px',
                    border: '1.5px solid #e4e7ec', background: 'transparent',
                    fontSize: '13px', fontWeight: '500', color: '#374151', cursor: 'pointer',
                  }}>
                    <MessageSquare size={14} /> Message
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFollowing((v) => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '9px', border: 'none',
                      background: following ? '#f3f4f6' : '#7c3aed',
                      color: following ? '#374151' : '#fff',
                      fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {following ? <><UserCheck size={14} /> Following</> : <><UserPlus size={14} /> Follow</>}
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px', marginBottom: '2px' }}>
            {profile.name}
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>
            @{profile.username || profile.email?.split('@')[0] || 'user'}
          </p>

          <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.65', marginBottom: '14px', maxWidth: '560px' }}>
            {profile.bio}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            {profile.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6b7280' }}>
                <MapPin size={13} color="#9ca3af" /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a href="#" onClick={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#7c3aed', textDecoration: 'none' }}>
                <Globe size={13} /> {profile.website}
              </a>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6b7280' }}>
              <Calendar size={13} color="#9ca3af" /> Joined {profile.joinedYear}
            </span>
          </div>

          {profile.skills?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {profile.skills.map((s) => <SkillBadge key={s} label={s} />)}
            </div>
          )}

          <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '20px' }} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <StatPill value={userPosts.length}              label="Posts"     />
            <div style={{ width: '1px', background: '#f3f4f6', margin: '4px 0' }} />
            <StatPill value={fmtNum(followerCount)}         label="Followers" />
            <div style={{ width: '1px', background: '#f3f4f6', margin: '4px 0' }} />
            <StatPill value={fmtNum(profile.following ?? 0)} label="Following" />
          </div>
        </motion.div>

        {/* ── Tabs ── */}
        <div style={{
          background: '#fff', border: '1px solid #e4e7ec',
          borderRadius: '12px', marginTop: '12px',
          display: 'flex', overflow: 'hidden',
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => tab.available && setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '13px 8px', border: 'none',
                  borderBottom: active ? '2px solid #7c3aed' : '2px solid transparent',
                  background: active ? 'rgba(124,58,237,0.04)' : 'transparent',
                  color: active ? '#7c3aed' : tab.available ? '#4b5563' : '#c4c9d4',
                  fontSize: '13px', fontWeight: active ? '700' : '500',
                  cursor: tab.available ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
                {!tab.available && (
                  <span style={{
                    fontSize: '10px', padding: '1px 5px', borderRadius: '4px',
                    background: '#f3f4f6', color: '#9ca3af', fontWeight: '500',
                    display: 'inline-flex', alignItems: 'center', gap: '2px',
                  }}>
                    <Lock size={9} /> Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Posts ── */}
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {userPosts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px 20px',
                  background: '#fff', border: '1px solid #e4e7ec', borderRadius: '14px',
                }}>
                  <p style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</p>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>No posts yet</p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>Posts you share will appear here.</p>
                </div>
              ) : (
                <>
                  {pinnedPost && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', paddingLeft: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>📌</span>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pinned post</span>
                      </div>
                      <PostCard post={pinnedPost} index={0} />
                    </div>
                  )}
                  <div style={{ paddingLeft: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase' }}>All posts</span>
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
      `}</style>
    </div>
  );
}
