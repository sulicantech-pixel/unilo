import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COLORS } from '../utils/designSystem';

const NAV_ITEMS = [
  {
    to: '/', label: 'Explore', end: true,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke={active ? COLORS.brand : COLORS.muted}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? `${COLORS.brand}20` : 'none'} />
        <path d="M9 22V12h6v10" stroke={active ? COLORS.brand : COLORS.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/wishlist', label: 'Wishlists', end: false,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          stroke={active ? COLORS.brand : COLORS.muted}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? `${COLORS.brand}30` : 'none'} />
      </svg>
    ),
  },
  {
    to: '/map', label: 'Map', end: false,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"
          stroke={active ? COLORS.brand : COLORS.muted}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? `${COLORS.brand}20` : 'none'} />
        <circle cx="12" cy="10" r="3" stroke={active ? COLORS.brand : COLORS.muted} strokeWidth="2"
          fill={active ? COLORS.brand : 'none'} />
      </svg>
    ),
  },
  {
    to: '/community', label: 'Community', end: false,
    badge: 3,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          stroke={active ? COLORS.brand : COLORS.muted}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          fill={active ? `${COLORS.brand}20` : 'none'} />
      </svg>
    ),
  },
  {
    to: '/profile', label: 'Profile', end: false,
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? COLORS.brand : COLORS.muted} strokeWidth="2"
          fill={active ? `${COLORS.brand}20` : 'none'} />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7"
          stroke={active ? COLORS.brand : COLORS.muted} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function BottomNav({ onOpenQuickList, inCommunity = false }) {
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        backgroundColor: `${COLORS.navy}ee`,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${COLORS.glassBorder}`,
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative flex items-center justify-around px-2 py-1">

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex-1"
          >
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center justify-center py-2 gap-0.5 relative"
                whileTap={{ scale: 0.9 }}
              >
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-0.5 w-5 h-0.5 rounded-full"
                    layoutId="activeIndicator"
                    style={{ backgroundColor: COLORS.brand }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon + badge wrapper */}
                <div className="relative">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {item.icon(isActive)}
                  </motion.div>

                  {/* Badge */}
                  {item.badge > 0 && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ backgroundColor: COLORS.brand, color: '#fff' }}
                    >
                      {item.badge}
                    </div>
                  )}
                </div>

                <span
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? COLORS.brand : COLORS.muted }}
                >
                  {item.label}
                </span>

                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl -z-10"
                    style={{ background: `radial-gradient(circle, ${COLORS.brand}12 0%, transparent 70%)` }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}

        {/* ➕ Floating List Button — smaller, higher, not covering Profile */}
        {!inCommunity && (
          <motion.button
            onClick={onOpenQuickList}
            className="absolute right-14 rounded-full flex items-center justify-center shadow-lg"
            style={{
              bottom: '52px',          /* floats above the nav */
              width: '44px',
              height: '44px',
              backgroundColor: COLORS.brand,
              boxShadow: `0 6px 20px ${COLORS.brand}50`,
            }}
            whileHover={{ scale: 1.12, boxShadow: `0 8px 28px ${COLORS.brand}70` }}
            whileTap={{ scale: 0.92 }}
            animate={{ y: [0, -5, 0] }}
            transition={{
              y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            }}
            title="List your space"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}
