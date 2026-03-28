import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// ── Feather-style SVG icons ──────────────────────────────────────────────────
const Icon = ({ name, size = 22, color = 'currentColor', filled = false }) => {
  const strokeWidth = 1.8;
  const paths = {
    home: filled
      ? <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={color} stroke={color} strokeWidth={strokeWidth}><path d="M9 22V12h6v10" fill="#0a0a0a" stroke={color} strokeWidth={strokeWidth}/></path>
      : <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus:   <><circle cx="12" cy="12" r="10" fill={filled ? color : 'none'}/><line x1="12" y1="8" x2="12" y2="16" stroke={filled ? '#fff' : color}/><line x1="8" y1="12" x2="16" y2="12" stroke={filled ? '#fff' : color}/></>,
    users:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    user:   <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    heart:  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={filled ? color : 'none'}/>,
    logIn:  <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

// ── Nav configs ──────────────────────────────────────────────────────────────
const LOGGED_OUT_NAV = [
  { to: '/',         icon: 'home',   label: 'Explore' },
  { to: '/wishlists',icon: 'heart',  label: 'Wishlists' },
  { to: '/login',    icon: 'logIn',  label: 'Log in' },
];

const LOGGED_IN_NAV = [
  { to: '/',           icon: 'home',   label: 'Explore' },
  { to: '/wishlists',  icon: 'heart',  label: 'Wishlists' },
  { to: '/community',  icon: 'users',  label: 'Community' },
  { to: '/profile',    icon: 'user',   label: 'Profile' },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function BottomNav() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const isLoggedIn = !!user;
  const NAV = isLoggedIn ? LOGGED_IN_NAV : LOGGED_OUT_NAV;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(15, 15, 15, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }

        /* hide on desktop — top nav handles it */
        @media(min-width: 768px) {
          .bottom-nav { display: none; }
        }

        .nav-inner {
          display: flex;
          align-items: center;
          height: 62px;
          padding: 0 8px;
          position: relative;
        }

        .nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px;
          text-decoration: none;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
        }
        .nav-item:hover { color: rgba(255,255,255,0.65); }
        .nav-item.active { color: #ff6b00; }

        .nav-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        /* ── FAB (Add listing) ── */
        .fab-wrap {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 0 12px;
        }

        .fab {
          width: 48px;
          height: 48px;
          background: #ff6b00;
          border: none;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255,107,0,0.4);
          transform: translateY(-8px);
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .fab:hover {
          background: #e55f00;
          transform: translateY(-10px) scale(1.05);
          box-shadow: 0 6px 24px rgba(255,107,0,0.5);
        }
        .fab:active { transform: translateY(-6px) scale(0.97); }

        .fab-label {
          font-size: 10px;
          font-weight: 600;
          color: #ff6b00;
          font-family: 'Outfit', sans-serif;
          letter-spacing: 0.02em;
          margin-top: -2px;
        }

        /* ── DESKTOP TOP NAV ── */
        .top-nav {
          display: none;
        }
        @media(min-width: 768px) {
          .top-nav {
            display: flex;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(10,10,10,0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.07);
            padding: 0 40px;
            height: 64px;
            gap: 0;
          }
        }

        .top-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #ff6b00;
          text-decoration: none;
          letter-spacing: -0.02em;
          margin-right: auto;
        }

        .top-links {
          display: flex;
          align-items: center;
          gap: 4px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .top-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 100px;
          text-decoration: none;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          font-weight: 600;
          font-family: 'Outfit', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .top-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.05); }
        .top-link.active { color: #ff6b00; }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .top-icon-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
        }
        .top-icon-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.85); }
        .top-icon-btn.active { color: #ff6b00; border-color: rgba(255,107,0,0.3); background: rgba(255,107,0,0.1); }

        .top-list-btn {
          display: flex; align-items: center; gap: 8px;
          background: #ff6b00; color: #fff; border: none;
          border-radius: 100px; padding: 9px 18px;
          font-size: 13px; font-weight: 700;
          font-family: 'Outfit', sans-serif; cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .top-list-btn:hover { background: #e55f00; transform: scale(1.02); }

        .top-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff6b00, #cc5200);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 13px;
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          border: 2px solid rgba(255,107,0,0.3);
        }
      `}</style>

      {/* ── DESKTOP TOP NAV ── */}
      <nav className="top-nav">
        <a href="/" className="top-logo">unilo</a>

        <div className="top-links">
          <NavLink to="/" end className={({isActive}) => `top-link${isActive?' active':''}`}>
            <Icon name="home" size={15} color="currentColor" /> Explore
          </NavLink>
          <NavLink to="/search" className={({isActive}) => `top-link${isActive?' active':''}`}>
            <Icon name="search" size={15} color="currentColor" /> Search
          </NavLink>
          <NavLink to="/clusters" className={({isActive}) => `top-link${isActive?' active':''}`}>
            <Icon name="users" size={15} color="currentColor" /> Clusters
          </NavLink>
          <NavLink to="/community" className={({isActive}) => `top-link${isActive?' active':''}`}>
            <Icon name="users" size={15} color="currentColor" /> Community
          </NavLink>
        </div>

        <div className="top-actions">
          <NavLink to="/wishlists" className={({isActive}) => `top-icon-btn${isActive?' active':''}`}>
            <Icon name="heart" size={16} color="currentColor" />
          </NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/profile" className={({isActive}) => `top-icon-btn${isActive?' active':''}`}>
                <Icon name="user" size={16} color="currentColor" />
              </NavLink>
              <div className="top-avatar" onClick={() => navigate('/profile')}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className="top-list-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                Log in
              </NavLink>
              <NavLink to="/register" className="top-list-btn">
                + List Room
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="bottom-nav">
        <div className="nav-inner">
          {isLoggedIn ? (
            /* Logged in: Explore | Wishlists | [FAB] | Community | Profile */
            <>
              {LOGGED_IN_NAV.slice(0, 2).map(({ to, icon, label }) => (
                <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `nav-item${isActive?' active':''}`}>
                  {({ isActive }) => (
                    <>
                      <Icon name={icon} size={22} color={isActive ? '#ff6b00' : 'rgba(255,255,255,0.35)'} />
                      <span className="nav-label">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}

              {/* FAB */}
              <div className="fab-wrap">
                <button className="fab" onClick={() => navigate('/listings/new')}>
                  <Icon name="plus" size={22} color="#fff" />
                </button>
                <span className="fab-label">Add</span>
              </div>

              {LOGGED_IN_NAV.slice(2).map(({ to, icon, label }) => (
                <NavLink key={to} to={to} className={({isActive}) => `nav-item${isActive?' active':''}`}>
                  {({ isActive }) => (
                    <>
                      <Icon name={icon} size={22} color={isActive ? '#ff6b00' : 'rgba(255,255,255,0.35)'} />
                      <span className="nav-label">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          ) : (
            /* Logged out: Explore | Wishlists | Log in */
            LOGGED_OUT_NAV.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end={to==='/'} className={({isActive}) => `nav-item${isActive?' active':''}`}>
                {({ isActive }) => (
                  <>
                    <Icon name={icon} size={22} color={isActive ? '#ff6b00' : 'rgba(255,255,255,0.35)'} />
                    <span className="nav-label">{label}</span>
                  </>
                )}
              </NavLink>
            ))
          )}
        </div>
      </nav>
    </>
  );
}
