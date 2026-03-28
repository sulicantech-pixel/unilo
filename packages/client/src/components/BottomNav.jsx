import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');

        /* ── MOBILE BOTTOM NAV ── */
        .mobile-nav {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 999;
          background: rgba(13,13,13,0.97);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        @media (min-width: 768px) { .mobile-nav { display: none !important; } }

        .mobile-nav-inner {
          display: flex; align-items: center;
          justify-content: space-around;
          width: 100%; height: 58px; padding: 0 4px;
        }

        .m-nav-item {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 3px; flex: 1; height: 100%;
          text-decoration: none;
          color: rgba(255,255,255,0.38);
          transition: color 0.2s;
          position: relative;
          border: none; background: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; padding: 0;
        }
        .m-nav-item:hover { color: rgba(255,255,255,0.7); }
        .m-nav-item.active { color: #ff6b00; }
        .m-nav-icon { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
        .m-nav-label { font-size: 10px; font-weight: 600; }
        .m-active-dot { position: absolute; top: 5px; width: 4px; height: 4px; border-radius: 50%; background: #ff6b00; }

        .m-add-wrap {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; text-decoration: none;
          color: rgba(255,255,255,0.38); font-family: 'Outfit', sans-serif;
        }
        .m-add-fab {
          width: 44px; height: 44px; border-radius: 14px;
          background: #ff6b00;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(255,107,0,0.45);
          margin-bottom: 2px; transition: all 0.2s;
        }
        .m-add-wrap:hover .m-add-fab { background: #e05a00; transform: scale(1.05); }

        /* ── DESKTOP TOP NAV ── */
        .desktop-nav {
          display: none;
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 998;
          background: rgba(13,13,13,0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        @media (min-width: 768px) { .desktop-nav { display: block; } }

        .desktop-nav-inner {
          display: flex; align-items: center;
          justify-content: space-between;
          max-width: 1400px; margin: 0 auto;
          padding: 0 40px; height: 56px; gap: 24px;
        }

        .d-logo {
          font-family: 'Fraunces', serif;
          font-size: 22px; font-weight: 700;
          color: #ff6b00; cursor: pointer;
          text-decoration: none; flex-shrink: 0;
        }

        .d-nav-links {
          display: flex; align-items: center;
          gap: 2px; flex: 1; justify-content: center;
        }

        .d-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 100px;
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-decoration: none; transition: all 0.2s;
          font-family: 'Outfit', sans-serif;
          border: none; background: none; cursor: pointer;
          white-space: nowrap;
        }
        .d-nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
        .d-nav-link.active { color: #ff6b00; background: rgba(255,107,0,0.1); }

        .d-nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        .d-outline-btn {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.75);
          padding: 7px 16px; border-radius: 100px;
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: all 0.2s;
          text-decoration: none;
        }
        .d-outline-btn:hover { border-color: #ff6b00; color: #ff6b00; background: rgba(255,107,0,0.08); }

        .d-solid-btn {
          background: #ff6b00; color: #fff; border: none;
          padding: 8px 18px; border-radius: 100px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Outfit', sans-serif; transition: all 0.2s;
          text-decoration: none;
        }
        .d-solid-btn:hover { background: #e05a00; }

        .d-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,107,0,0.15);
          border: 2px solid rgba(255,107,0,0.4);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 15px; transition: all 0.2s;
          text-decoration: none;
        }
        .d-avatar:hover { background: rgba(255,107,0,0.25); border-color: #ff6b00; }

        .d-username {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,0.75);
          font-family: 'Outfit', sans-serif;
          max-width: 90px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
      `}</style>

      {/* ── DESKTOP TOP NAV ── */}
      <nav className="desktop-nav">
        <div className="desktop-nav-inner">
          <NavLink to="/" className="d-logo">unilo</NavLink>

          <div className="d-nav-links">
            <NavLink to="/" end className={({ isActive }) => `d-nav-link${isActive ? ' active' : ''}`}>
              <HomeIcon /> Explore
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `d-nav-link${isActive ? ' active' : ''}`}>
              <SearchIcon /> Search
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => `d-nav-link${isActive ? ' active' : ''}`}>
              <MapIcon /> Map
            </NavLink>
            <NavLink to="/wishlist" className={({ isActive }) => `d-nav-link${isActive ? ' active' : ''}`}>
              <HeartIcon /> Wishlists
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/community" className={({ isActive }) => `d-nav-link${isActive ? ' active' : ''}`}>
                <CommunityIcon /> Community
              </NavLink>
            )}
          </div>

          <div className="d-nav-right">
            {isAuthenticated ? (
              <>
                <span className="d-username">{user?.name?.split(' ')[0]}</span>
                <NavLink to="/add-listing" className="d-outline-btn">+ List Room</NavLink>
                <NavLink to="/profile" className="d-avatar">👤</NavLink>
                <button className="d-outline-btn" onClick={handleLogout} style={{ borderColor: 'rgba(255,60,60,0.3)', color: 'rgba(255,100,100,0.8)' }}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="d-outline-btn">Log in</NavLink>
                <NavLink to="/register" className="d-solid-btn">Sign up free</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {isAuthenticated ? (
            <>
              <NavLink to="/" end className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><HomeIcon active={isActive} /></span><span className="m-nav-label">Explore</span></>)}
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><HeartIcon active={isActive} /></span><span className="m-nav-label">Wishlists</span></>)}
              </NavLink>
              <NavLink to="/add-listing" className="m-add-wrap">
                <div className="m-add-fab"><PlusIcon /></div>
                <span className="m-nav-label">Add</span>
              </NavLink>
              <NavLink to="/community" className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><CommunityIcon active={isActive} /></span><span className="m-nav-label">Community</span></>)}
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><ProfileIcon active={isActive} /></span><span className="m-nav-label">Profile</span></>)}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/" end className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><HomeIcon active={isActive} /></span><span className="m-nav-label">Explore</span></>)}
              </NavLink>
              <NavLink to="/wishlist" className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><HeartIcon active={isActive} /></span><span className="m-nav-label">Wishlists</span></>)}
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => `m-nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (<><span className="m-nav-icon"><ProfileIcon active={isActive} /></span><span className="m-nav-label">Log in</span></>)}
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function HomeIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function MapIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
}
function HeartIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#ff6b00' : 'none'} stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function PlusIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CommunityIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function ProfileIcon({ active }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#ff6b00' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
