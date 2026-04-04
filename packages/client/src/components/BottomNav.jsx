import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated } = useAuthStore();
  const path = location.pathname;

  const tabs = [
    { id: 'explore',   label: 'Explore',   route: '/',          Icon: ExploreIcon },
    { id: 'wishlist',  label: 'Wishlists',  route: '/wishlist',  Icon: WishlistIcon },
    { id: 'plus',      label: '',           route: isAuthenticated ? '/create' : '/login', Icon: PlusIcon, center: true },
    { id: 'community', label: 'Community',  route: '/community', Icon: CommunityIcon },
    { id: 'profile',   label: 'Profile',    route: isAuthenticated ? '/account' : '/login', Icon: ProfileIcon },
  ];

  const isActive = (route) => {
    if (route === '/') return path === '/';
    return path.startsWith(route);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10,10,10,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.07);
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 8px 8px;
          padding-bottom: max(12px, env(safe-area-inset-bottom));
        }

        .nav-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 12px;
          min-width: 52px;
          transition: opacity 0.15s;
        }
        .nav-tab:active { opacity: 0.7; }

        .nav-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          transition: transform 0.2s;
        }
        .nav-tab:active .nav-icon-wrap { transform: scale(0.88); }

        .nav-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: color 0.15s;
        }

        /* Center plus button */
        .nav-plus-outer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
        }
        .nav-plus-btn {
          width: 50px;
          height: 50px;
          background: #ff6b00;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -18px;
          box-shadow: 0 4px 20px rgba(255,107,0,0.45);
          transition: transform 0.15s, box-shadow 0.15s;
          border: 3px solid rgba(10,10,10,0.97);
        }
        .nav-plus-outer:active .nav-plus-btn {
          transform: scale(0.92);
          box-shadow: 0 2px 10px rgba(255,107,0,0.3);
        }
        .nav-plus-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.01em;
        }
      `}</style>

      <nav className="bottom-nav">
        {tabs.map(({ id, label, route, Icon, center }) => {
          const active = isActive(route);
          const color  = active ? '#ff6b00' : 'rgba(255,255,255,0.38)';

          if (center) {
            return (
              <button key={id} className="nav-plus-outer" onClick={() => navigate(route)}>
                <div className="nav-plus-btn">
                  <Icon />
                </div>
                <span className="nav-plus-label">{label || ' '}</span>
              </button>
            );
          }

          return (
            <button key={id} className="nav-tab" onClick={() => navigate(route)}>
              <span className="nav-icon-wrap">
                <Icon active={active} color={color} />
              </span>
              <span className="nav-label" style={{ color }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function ExploreIcon({ active, color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill={active ? color : 'none'} stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

function WishlistIcon({ active, color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill={active ? color : 'none'}
      stroke={color} strokeWidth={active ? 2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="2.8" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function CommunityIcon({ active, color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4" fill={active ? color : 'none'}/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}

function ProfileIcon({ active, color }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={active ? 2.2 : 1.8}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4" fill={active ? color : 'none'}/>
    </svg>
  );
}
