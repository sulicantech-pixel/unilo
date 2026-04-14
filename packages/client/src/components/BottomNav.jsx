import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { COLORS, ANIMATIONS } from '../utils/designSystem';

const MAIN_NAV = [
  { to: '/', icon: '🏠', label: 'Explore', badge: 0 },
  { to: '/search', icon: '❤️', label: 'Wishlists', badge: 0 },
  { to: '/map', icon: '📍', label: 'Map', badge: 0 },
  { to: '/community', icon: '💬', label: 'Community', badge: 3 },
  { to: '/profile', icon: '👤', label: 'Profile', badge: 0 },
];

export default function BottomNav({ onOpenQuickList, inCommunity = false }) {
  const location = useLocation();
  const isInCommunity = location.pathname === '/community' || inCommunity;

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{
        backgroundColor: `${COLORS.navy}dd`,
        backdropFilter: 'blur(20px)',
        borderTopColor: COLORS.glassBorder,
        borderTopWidth: '1px',
      }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between px-2 sm:px-4">
        {MAIN_NAV.map((item, idx) => {
          const isActive = location.pathname === item.to;

          return (
            <motion.div
              key={item.to}
              className="flex-1 relative"
              whileHover={{ scale: 1.05 }}
            >
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: COLORS.brand }}
                  layoutId="activeTab"
                  animate={{
                    boxShadow: [
                      `0 0 10px ${COLORS.brand}`,
                      `0 0 20px ${COLORS.brand}`,
                      `0 0 10px ${COLORS.brand}`,
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={`flex flex-col items-center justify-center py-3 gap-1 relative transition-all duration-200`}
              >
                {({ isActive: active }) => (
                  <>
                    <motion.div
                      className="relative text-xl sm:text-2xl"
                      animate={{
                        scale: active ? 1.2 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                    >
                      {item.icon}

                      {/* Badge */}
                      {item.badge > 0 && (
                        <motion.span
                          className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: COLORS.brand,
                            color: COLORS.navy,
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                          }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.div>

                    <span
                      className={`text-[10px] sm:text-xs font-semibold transition-all duration-200`}
                      style={{
                        color: active ? COLORS.brand : COLORS.muted,
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active state glow */}
                    {active && (
                      <motion.div
                        className="absolute inset-0 rounded-xl -z-10"
                        style={{
                          background: `radial-gradient(circle, ${COLORS.brand}20 0%, transparent 70%)`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 pointer-events-none -z-10"
                style={{ backgroundColor: COLORS.brand }}
              />
            </motion.div>
          );
        })}

        {/* Floating ➕ Button (Main Nav) */}
        {!isInCommunity && (
          <motion.button
            onClick={onOpenQuickList}
            className="absolute -top-8 right-6 w-16 h-16 rounded-full font-bold text-3xl shadow-2xl flex items-center justify-center"
            style={{
              backgroundColor: COLORS.brand,
              color: COLORS.navy,
              boxShadow: `0 8px 24px ${COLORS.brand}40`,
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: `0 12px 32px ${COLORS.brand}60`,
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              y: {
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              hover: {
                duration: 0.2,
              },
            }}
            title="List your space"
          >
            ➕
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}
