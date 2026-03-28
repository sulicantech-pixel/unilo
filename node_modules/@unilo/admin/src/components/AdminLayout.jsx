import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../store/authStore';

const HEAD_NAV = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/pending',    icon: '⏳', label: 'Pending',  badge: true },
  { to: '/listings',   icon: '🏠', label: 'All Listings' },
  { to: '/users',      icon: '👥', label: 'Users' },
  { to: '/finance',    icon: '💰', label: 'Finance' },
  { to: '/analytics',  icon: '📈', label: 'Analytics' },
];

const LANDLORD_NAV = [
  { to: '/my-listings', icon: '🏠', label: 'My Listings' },
  { to: '/listing/new', icon: '➕', label: 'Add Listing' },
];

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const isHeadAdmin = user?.role === 'head_admin';
  const nav = isHeadAdmin ? HEAD_NAV : LANDLORD_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-dvh">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-navy-800 border-r border-white/10 flex flex-col sticky top-0 h-dvh">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <span className="font-display font-bold text-xl text-brand">Unilo</span>
          <span className="text-muted text-xs block mt-0.5">
            {isHeadAdmin ? 'Head Admin' : 'Landlord Panel'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-brand/15 text-brand font-medium'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-cream text-sm font-medium truncate">{user?.name}</p>
          <p className="text-muted text-xs truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="text-muted text-xs mt-3 hover:text-danger transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
