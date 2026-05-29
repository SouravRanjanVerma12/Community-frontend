import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, LogIn, UserPlus, Zap, Compass, Users2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

function Avatar({ name, src, size = 34 }) {
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e4e7ec' }} />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${hue},55%,55%)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: '600', flexShrink: 0, userSelect: 'none' }}>
      {initials}
    </div>
  );
}

const NAV_TABS = [
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/collab',  label: 'Collab',  icon: Users2  },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: '60px', background: '#ffffff',
      borderBottom: '1px solid #e4e7ec',
      display: 'flex', alignItems: 'center',
      padding: '0 28px', gap: '0',
    }}>
      {/* Logo */}
      <Link to="/explore" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0, marginRight: '24px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={16} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827', letterSpacing: '-0.3px' }}>
          DevCommunity
        </span>
      </Link>

      {/* Center tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', gap: '2px' }}>
        {NAV_TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '0 16px',
              borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
              color: isActive ? '#7c3aed' : '#4b5563',
              fontSize: '14px', fontWeight: isActive ? '600' : '500',
              textDecoration: 'none',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            })}
            onMouseEnter={(e) => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.color = '#111827'; }}
            onMouseLeave={(e) => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.color = '#4b5563'; }}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user ? (
          <>
            <Link to={`/profile/${user._id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <Avatar name={user.name} src={user.avatarUrl || null} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {user.name.split(' ')[0]}
              </span>
            </Link>
            <button onClick={handleLogout} title="Log out" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e4e7ec', background: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              <LogOut size={14} />
              <span className="nav-logout-label">Log out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/" style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #e4e7ec', color: '#374151', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <LogIn size={14} /> Log in
            </Link>
            <Link to="/register" style={{ padding: '7px 14px', borderRadius: '8px', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <UserPlus size={14} /> Sign up
            </Link>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) { .nav-logout-label { display: none; } }
        @media (max-width: 480px) { .nav-tab-label { display: none; } }
      `}</style>
    </nav>
  );
}
