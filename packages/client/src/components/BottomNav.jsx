import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/* ─── Feather-style SVG icons ─────────────────────────────────────── */
const Icon = {
  Explore: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Wishlist: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Login: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  Community: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

/* ─── Nav items ───────────────────────────────────────────────────── */
const LOGGED_OUT_NAV = [
  { to: '/',        label: 'Explore',   Icon: Icon.Explore },
  { to: '/wishlist', label: 'Wishlists', Icon: Icon.Wishlist },
  { to: '/login',   label: 'Log in',    Icon: Icon.Login },
];

const LOGGED_IN_LEFT = [
  { to: '/',        label: 'Explore',   Icon: Icon.Explore },
  { to: '/wishlist', label: 'Wishlists', Icon: Icon.Wishlist },
];

const LOGGED_IN_RIGHT = [
  { to: '/community', label: 'Community', Icon: Icon.Community },
  { to: '/profile',   label: 'Profile',   Icon: Icon.Profile },
];

/* ─── Styles ──────────────────────────────────────────────────────── */
const navStyle = {
  position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
  background: 'rgba(10,10,10,0.96)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  fontFamily: "'Outfit', sans-serif",
};

const rowStyle = {
  display: 'flex', alignItems: 'center',
  height: 60,
};

const tabStyle = (active) => ({
  flex: 1, display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  gap: 3, paddingTop: 6, paddingBottom: 6,
  color: active ? '#ff6b00' : 'rgba(255,255,255,0.38)',
  textDecoration: 'none', transition: 'color 0.15s',
  border: 'none', background: 'none', cursor: 'pointer',
});

const labelStyle = { fontSize: 10, fontWeight: 500, lineHeight: 1 };

const fabStyle = {
  width: 50, height: 50, borderRadius: '50%',
  background: '#ff6b00',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(255,107,0,0.45)',
  flexShrink: 0,
  marginBottom: 8,
  transition: 'transform 0.15s, box-shadow 0.15s',
};

/* ─── Component ───────────────────────────────────────────────────── */
export default function BottomNav() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <nav style={navStyle}>
        <div style={rowStyle}>
          {LOGGED_OUT_NAV.map(({ to, label, Icon: NavIcon }) => (
            <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => tabStyle(isActive)}>
              <NavIcon />
              <span style={labelStyle}>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav style={navStyle}>
      <div style={rowStyle}>
        {/* Left 2 tabs */}
        {LOGGED_IN_LEFT.map(({ to, label, Icon: NavIcon }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => tabStyle(isActive)}>
            <NavIcon />
            <span style={labelStyle}>{label}</span>
          </NavLink>
        ))}

        {/* Centre FAB */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <button
            style={fabStyle}
            onClick={() => navigate('/search')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,107,0,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,0,0.45)'; }}
          >
            <Icon.Search />
          </button>
        </div>

        {/* Right 2 tabs */}
        {LOGGED_IN_RIGHT.map(({ to, label, Icon: NavIcon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => tabStyle(isActive)}>
            <NavIcon />
            <span style={labelStyle}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
