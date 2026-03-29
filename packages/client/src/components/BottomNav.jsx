import { NavLink } from 'react-router-dom';

const NAV = [
  {
    to: '/',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#ff6b00' : 'none'}
        stroke={active ? '#ff6b00' : 'rgba(255,255,255,0.38)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/search',
    label: 'Search',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ff6b00' : 'rgba(255,255,255,0.38)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    to: '/map',
    label: 'Map',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ff6b00' : 'rgba(255,255,255,0.38)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    to: '/wishlist',
    label: 'Saved',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? '#ff6b00' : 'none'}
        stroke={active ? '#ff6b00' : 'rgba(255,255,255,0.38)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
  {
    to: '/login',
    label: 'Account',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#ff6b00' : 'rgba(255,255,255,0.38)'} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ display: 'flex', maxWidth: 480, margin: '0 auto' }}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={{ flex: 1, textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '10px 0 8px',
                  gap: 3,
                  transition: 'opacity 0.15s',
                }}
              >
                {icon(isActive)}
                <span
                  style={{
                    fontSize: 10, fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600, letterSpacing: '0.02em',
                    color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.35)',
                    transition: 'color 0.15s',
                  }}
                >
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
