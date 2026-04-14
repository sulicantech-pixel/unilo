// utils/designSystem.js
// Color System
export const COLORS = {
  // Primary
  navy: '#0a0a0a',
  cream: '#f5f5f5',
  brand: '#ff6b00',
  brandDark: '#e55f00',
  brandLight: '#ff8533',

  // Community (Purple theme)
  community: '#8b5cf6',
  communityDark: '#7c3aed',
  communityLight: '#a78bfa',

  // Neutrals
  muted: 'rgba(255,255,255,0.6)',
  mutedLight: 'rgba(255,255,255,0.3)',
  mutedDark: 'rgba(255,255,255,0.15)',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.1)',

  // States
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

// Framer Motion Variants
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },

  slideUpFade: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },

  slideDownFade: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },

  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25 },
  },

  communityEnter: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },

  cardHover: {
    whileHover: { scale: 1.02, transition: { duration: 0.2 } },
    whileTap: { scale: 0.98 },
  },

  buttonPress: {
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 400, damping: 10 },
  },

  pulseAnimation: {
    animate: { boxShadow: [
      '0 0 0 0 rgba(255, 107, 0, 0.7)',
      '0 0 0 10px rgba(255, 107, 0, 0)',
    ]},
    transition: { duration: 2, repeat: Infinity },
  },

  shimmer: {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },

  glow: {
    animate: {
      boxShadow: [
        '0 0 20px rgba(255, 107, 0, 0)',
        '0 0 20px rgba(255, 107, 0, 0.5)',
        '0 0 20px rgba(255, 107, 0, 0)',
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

// MaterialCommunityIcons Mapping
export const ICONS = {
  home: 'home-outline',
  homeActive: 'home',
  heart: 'heart-outline',
  heartActive: 'heart',
  map: 'map-outline',
  mapActive: 'map',
  users: 'account-group-outline',
  usersActive: 'account-group',
  user: 'account-outline',
  userActive: 'account',
  plus: 'plus-circle-outline',
  plusActive: 'plus-circle',
  search: 'magnify',
  filter: 'tune-variant',
  close: 'close',
  back: 'arrow-left',
  check: 'check-circle',
  star: 'star',
  starEmpty: 'star-outline',
  trending: 'trending-up',
  location: 'map-marker',
  phone: 'phone-outline',
  email: 'email-outline',
  checkmark: 'check',
  camera: 'camera-outline',
  gallery: 'image-multiple-outline',
  video: 'video-outline',
  share: 'share-variant-outline',
  comment: 'comment-outline',
  like: 'heart-outline',
  menu: 'menu',
  download: 'download-outline',
  university: 'school-outline',
  building: 'home-city-outline',
  cluster: 'puzzle-outline',
  verified: 'check-decagram',
  warning: 'alert-outline',
  success: 'check-circle-outline',
  error: 'close-circle-outline',
  loading: 'loading',
  dropdown: 'chevron-down',
  chevronRight: 'chevron-right',
  arrowRight: 'arrow-right',
};

// Tailwind Utility Classes (for shadows, borders, etc)
export const STYLES = {
  cardBase: 'bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm',
  cardHover: 'hover:bg-white/8 hover:border-white/20 hover:shadow-lg transition-all duration-200',
  buttonBase: 'font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2',
  buttonPrimary: 'bg-brand hover:bg-brandDark text-navy shadow-lg hover:shadow-xl',
  buttonSecondary: 'bg-white/10 hover:bg-white/20 text-cream border border-white/20',
  buttonGhost: 'text-cream hover:bg-white/10',
  inputBase: 'bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-cream placeholder-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all',
  badge: 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
  glassEffect: 'bg-white/[0.02] backdrop-blur-md border border-white/10',
  shadowElevated: 'shadow-2xl shadow-black/30',
  shadowSoft: 'shadow-lg shadow-black/20',
};

// Typography
export const TYPOGRAPHY = {
  heroLarge: 'text-5xl sm:text-6xl font-bold leading-tight',
  h1: 'text-4xl sm:text-5xl font-bold',
  h2: 'text-3xl sm:text-4xl font-bold',
  h3: 'text-2xl sm:text-3xl font-semibold',
  h4: 'text-xl sm:text-2xl font-semibold',
  body: 'text-base sm:text-lg',
  bodySmall: 'text-sm',
  label: 'text-xs sm:text-sm font-medium text-muted',
  caption: 'text-xs text-muted/80',
};

// Responsive Grid
export const GRID = {
  listings: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6',
  horizontal: 'flex gap-3 overflow-x-auto pb-2 scrollbar-hide',
};
