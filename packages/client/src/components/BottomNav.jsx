import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const BRAND = '#ff6b00';
const MUTED = 'rgba(255,255,255,0.42)';

// All icons are inline SVG — no external library needed
const HomeIcon = (filled) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? BRAND : 'none'} stroke={filled ? BRAND : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const HeartIcon = (filled) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? BRAND : 'none'} stroke={filled ? BRAND : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const MapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3" fill="white"/>
  </svg>
);

const CommunityIcon = (filled) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? BRAND : 'none'} stroke={filled ? BRAND : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const ProfileIcon = (filled) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? BRAND : 'none'} stroke={filled ? BRAND : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function BottomNav({ onOpenQuickList, inCommunity }) {
  const user = useAuthStore(s => s.user);

  const NavItem = ({ to, icon, label, end: isEnd }) => (
    <NavLink to={to} end={isEnd} className="flex-1">
      {({ isActive }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10, gap: 3, color: isActive ? BRAND : MUTED, transition: 'color 0.15s' }}>
          {icon(isActive)}
          <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400, fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>{label}</span>
        </div>
      )}
    </NavLink>
  );

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: 'rgba(10,10,10,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <NavItem to="/" icon={HomeIcon} label="Explore" end />
        <NavItem to="/wishlist" icon={HeartIcon} label="Wishlists" />

        {/* Centre FAB — Map */}
        <NavLink to="/map" className="flex-1">
          {({ isActive }) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: 6 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', marginTop: -18,
                backgroundColor: isActive ? '#e55f00' : BRAND,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(255,107,0,0.5)',
                border: '2px solid rgba(255,255,255,0.15)',
                transition: 'background-color 0.15s',
              }}>
                {MapIcon()}
              </div>
              <span style={{ fontSize: 9, color: isActive ? BRAND : MUTED, marginTop: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: isActive ? 600 : 400 }}>Map</span>
            </div>
          )}
        </NavLink>

        <NavItem to="/community" icon={CommunityIcon} label="Community" />

        {/* Profile — shows avatar initial if logged in */}
        <NavLink to="/profile" className="flex-1">
          {({ isActive }) => (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingBottom: 10, gap: 3, color: isActive ? BRAND : MUTED, transition: 'color 0.15s' }}>
              {user ? (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: isActive ? `${BRAND}30` : 'rgba(255,255,255,0.1)',
                  border: `2px solid ${isActive ? BRAND : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: isActive ? BRAND : MUTED,
                  fontFamily: 'Syne, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {(user.first_name?.[0] || '').toUpperCase()}
                </div>
              ) : ProfileIcon(isActive)}
              <span style={{ fontSize: 9, fontWeight: isActive ? 600 : 400, fontFamily: 'DM Sans, sans-serif', lineHeight: 1 }}>Profile</span>
            </div>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
