import { NavLink, useLocation } from 'react-router-dom';

const MAIN_NAV = [
  { to: '/',        icon: '🏠', label: 'Explore' },
  { to: '/search',  icon: '❤️', label: 'Wishlists' },
  { to: '/map',     icon: '📍', label: 'Map' },
  { to: '/community', icon: '💬', label: 'Community' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

const COMMUNITY_NAV = [
  { to: '/community?tab=explore', icon: '🔍', label: 'Explore' },
  { to: '/community?tab=trends', icon: '🔥', label: 'Trends' },
  { tab: 'create', icon: '➕', label: 'Create' },
  { to: '/community?tab=groups', icon: '👥', label: 'Groups' },
  { to: '/community?tab=profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav({ onOpenQuickList, inCommunity = false }) {
  const location = useLocation();
  const isInCommunity = location.pathname === '/community' || inCommunity;
  const navItems = isInCommunity ? COMMUNITY_NAV : MAIN_NAV;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur border-t border-white/10 safe-bottom">
      <div className="flex items-center justify-between relative">
        {navItems.map((item, idx) => {
          // Center + button (index 2 in community nav)
          if (item.tab === 'create' && isInCommunity) {
            return (
              <button
                key={idx}
                onClick={onOpenQuickList}
                className="flex-1 flex flex-col items-center justify-center py-3 text-brand hover:bg-brand/10 transition relative"
                title="Create post or list"
              >
                <span className="text-2xl leading-none">➕</span>
                <span className="text-[10px] font-body mt-0.5">{item.label}</span>
              </button>
            );
          }

          // Main nav + button (floating, top-right of BottomNav)
          if (!isInCommunity && idx === navItems.length - 1) {
            return (
              <div key={idx} className="flex-1 relative flex flex-col items-center justify-center py-3">
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center py-2 gap-0.5 transition-colors w-full ${
                      isActive ? 'text-brand' : 'text-muted hover:text-cream'
                    }`
                  }
                >
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span className="text-[10px] font-body">{item.label}</span>
                </NavLink>

                {/* Floating + button (only on main nav) */}
                <button
                  onClick={onOpenQuickList}
                  className="absolute -top-8 right-6 w-14 h-14 rounded-full bg-brand text-navy font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all"
                  title="List your space"
                >
                  ➕
                </button>
              </div>
            );
          }

          // Regular nav items
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                  isActive ? 'text-brand' : 'text-muted hover:text-cream'
                }`
              }
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-body">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
