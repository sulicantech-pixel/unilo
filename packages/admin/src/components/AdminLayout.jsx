import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAdminAuth } from '../store/authStore';
import api from '../lib/api';

const HEAD_NAV = [
  { to: '/dashboard',  icon: '⬡', label: 'Intelligence' },
  { to: '/pending',    icon: '⏳', label: 'Pending',     badge: true },
  { to: '/listings',   icon: '🏠', label: 'All Listings' },
  { to: '/users',      icon: '👥', label: 'Users' },
  { to: '/finance',    icon: '💰', label: 'Finance' },
  { to: '/analytics',  icon: '📈', label: 'Analytics' },
];

// Analyst sees everything except destructive actions — same pages, restricted in-page
const ANALYST_NAV = [
  { to: '/dashboard',  icon: '⬡', label: 'Intelligence' },
  { to: '/listings',   icon: '🏠', label: 'All Listings' },
  { to: '/users',      icon: '👥', label: 'Users' },
  { to: '/finance',    icon: '💰', label: 'Finance' },
  { to: '/analytics',  icon: '📈', label: 'Analytics' },
];

const LANDLORD_NAV = [
  { to: '/my-listings', icon: '🏠', label: 'My Listings' },
  { to: '/listing/new', icon: '＋', label: 'Add Listing' },
];

const ROLE_LABEL = {
  head_admin: 'Head Admin',
  user_admin: 'Landlord Panel',
  analyst:    'Analyst View',
};

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const isHeadAdmin = user?.role === 'head_admin';
  const isAnalyst   = user?.role === 'analyst';
  const isLandlord  = user?.role === 'user_admin';

  const nav = isHeadAdmin ? HEAD_NAV : isAnalyst ? ANALYST_NAV : LANDLORD_NAV;

  // Live pending count — shown in sidebar badge
  const { data: pendingData } = useQuery({
    queryKey: ['pending-count'],
    queryFn: () => api.get('/admin/pending').then((r) => r.data),
    refetchInterval: 60_000,
    enabled: isHeadAdmin,
  });
  const pendingCount = pendingData?.length || 0;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-dvh">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-navy-800 border-r border-white/10 flex flex-col sticky top-0 h-dvh">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xl text-brand">Unilo</span>
            {isHeadAdmin && pendingCount > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-muted text-xs block mt-0.5">
            {ROLE_LABEL[user?.role] || 'Admin'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-body transition-colors ${
                  isActive
                    ? 'bg-brand/15 text-brand font-medium'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base w-5 text-center">{icon}</span>
                {label}
              </div>
              {badge && isHeadAdmin && pendingCount > 0 && (
                <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Analyst badge */}
        {isAnalyst && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-blue-500/8 border border-blue-500/15">
            <p className="text-blue-400 text-[10px] font-medium">Read-only + notes access</p>
          </div>
        )}

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

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-navy">
        <Outlet />
      </main>
    </div>
  );
}
