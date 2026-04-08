/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0D1B2A', 800: '#0f2035', 700: '#162840', 600: '#1e3550' },
        brand:   { DEFAULT: '#ff6b00', light: '#ff8533', dark: '#e55f00' },
        gold:    { DEFAULT: '#F4A944', light: '#F9C07A' },
        cream:   '#F5F0E8',
        muted:   '#8A9BB0',
        danger:  '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
