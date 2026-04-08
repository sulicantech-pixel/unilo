import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/',        icon: '🏠', label: 'Home' },
  { to: '/search',  icon: '🔍', label: 'Search' },
  { to: '/map',     icon: '📍', label: 'Map' },
  { to: '/wishlist',icon: '❤️', label: 'Saved' },
];

export default function BottomNav({ onOpenQuickList }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur border-t border-white/10 safe-bottom">
      <div className="flex items-stretch">
        {/* Navigation items */}
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                isActive ? 'text-brand' : 'text-muted hover:text-cream'
              }`
            }
          >
            <span className="text-xl leading-none">{icon}</span>
            <span className="text-[10px] font-body">{label}</span>
          </NavLink>
        ))}

        {/* Floating "+" button for Quick List */}
        <button
          onClick={onOpenQuickList}
          className="absolute bottom-20 right-6 w-14 h-14 rounded-full bg-brand text-navy font-bold text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
          title="List your property"
        >
          ＋
        </button>
      </div>
    </nav>
  );
}
