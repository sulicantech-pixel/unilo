import { NavLink } from 'react-router-dom';

const NAV = [
  {
    to: '/',
    label: 'Explore',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/wishlist',
    label: 'Wishlists',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
  {
    to: '/map',
    label: 'Map',
    isCenter: true,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill={active ? 'currentColor' : 'none'}/>
      </svg>
    ),
  },
  {
    to: '/community',
    label: 'Community',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/login',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        backgroundColor: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-stretch">
        {NAV.map(({ to, label, icon, isCenter }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1"
          >
            {({ isActive }) =>
              isCenter ? (
                /* Centre FAB — map pin button */
                <div className="flex flex-col items-center justify-center py-2 -mt-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
                    style={{
                      backgroundColor: isActive ? '#e55f00' : '#ff6b00',
                      boxShadow: '0 4px 20px rgba(255,107,0,0.45)',
                    }}
                  >
                    <span style={{ color: '#fff' }}>{icon(isActive)}</span>
                  </div>
                  <span
                    className="text-[9px] mt-1 font-body"
                    style={{ color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.5)' }}
                  >
                    {label}
                  </span>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors"
                  style={{ color: isActive ? '#ff6b00' : 'rgba(255,255,255,0.45)' }}
                >
                  {icon(isActive)}
                  <span className="text-[9px] font-body leading-none">{label}</span>
                </div>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
