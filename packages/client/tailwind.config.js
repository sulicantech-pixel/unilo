/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette — used everywhere
        ink:    { DEFAULT: '#0a0a0a', 900: '#111111', 800: '#161616', 700: '#1e1e1e', 600: '#262626' },
        brand:  { DEFAULT: '#ff6b00', light: '#ff8533', dark: '#e55f00', muted: 'rgba(255,107,0,0.15)' },
        cream:  { DEFAULT: '#f5f0e8', muted: 'rgba(245,240,232,0.6)', faint: 'rgba(245,240,232,0.08)' },
        wire:   'rgba(255,255,255,0.08)',      // borders
        muted:  'rgba(255,255,255,0.38)',      // secondary text
        ghost:  'rgba(255,255,255,0.05)',      // subtle fills
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        serif:   ['"Fraunces"', 'serif'],
      },
      borderRadius: {
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        brand: '0 0 40px rgba(255,107,0,0.25)',
        card:  '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
