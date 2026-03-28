import { NavLink, useNavigate } from 'react-router-dom';

// Read auth from localStorage — adjust key to match your auth store
function useIsLoggedIn() {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token || user);
  } catch {
    return false;
  }
}

const LOGGED_OUT_NAV = [
  { to: '/',         label: 'Explore',   icon: LoggedOutExploreIcon },
  { to: '/wishlist', label: 'Wishlists', icon: WishlistIcon },
  { to: '/login',    label: 'Log in',    icon: ProfileIcon, isLogin: true },
];

const LOGGED_IN_NAV = [
  { to: '/',           label: 'Explore',   icon: ExploreIcon },
  { to: '/wishlist',   label: 'Wishlists', icon: WishlistIcon },
  { to: '/add-listing',label: 'Add',       icon: AddIcon, isAdd: true },
  { to: '/community',  label: 'Community', icon: CommunityIcon },
  { to: '/profile',    label: 'Profile',   icon: ProfileIcon },
];

export default function BottomNav() {
  const isLoggedIn = useIsLoggedIn();
  const navigate = useNavigate();
  const NAV = isLoggedIn ? LOGGED_IN_NAV : LOGGED_OUT_NAV;

  return (
    <>
      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 999;
          background: rgba(13,13,13,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .bottom-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
          height: 58px;
          padding: 0 4px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          flex: 1;
          height: 100%;
          text-decoration: none;
          color: rgba(255,255,255,0.38);
          transition: color 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          font-family: 'Outfit', sans-serif;
          position: relative;
        }

        .nav-item:hover { color: rgba(255,255,255,0.7); }
        .nav-item.active { color: #ff6b00; }

        .nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }

        .add-fab {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: #ff6b00;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(255,107,0,0.4);
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .add-fab:hover {
          background: #e05a00;
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(255,107,0,0.5);
        }

        .nav-active-dot {
          position: absolute;
          top: 4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ff6b00;
        }

        @media (min-width: 768px) {
          .bottom-nav { display: none; }
        }
      `}</style>

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {NAV.map(({ to, label, icon: Icon, isAdd, isLogin }) => {
            if (isAdd) {
              return (
                <NavLink key={to} to={to} className="nav-item" style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <>
                      <div className="add-fab">
                        <Icon active={true} />
                      </div>
                      <span className="nav-label" style={{ color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.38)' }}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }

            if (isLogin) {
              return (
                <NavLink key={to} to={to} className="nav-item" style={{ textDecoration: 'none' }}>
                  {({ isActive }) => (
                    <>
                      <div className="nav-icon">
                        <Icon active={isActive} />
                      </div>
                      <span className="nav-label" style={{ color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.38)' }}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className="nav-item"
                style={{ textDecoration: 'none' }}
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="nav-active-dot" />}
                    <div className="nav-icon">
                      <Icon active={isActive} />
                    </div>
                    <span className="nav-label" style={{ color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.38)' }}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* ── SVG ICONS ── */
function ExploreIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function LoggedOutExploreIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function WishlistIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#ff6b00' : 'none'} stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function AddIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function CommunityIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
