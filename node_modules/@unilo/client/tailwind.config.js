/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#0D1B2A', 800: '#0f2035', 700: '#162840' },
        brand:  { DEFAULT: '#00C2A8', light: '#00DDBE', dark: '#00A38E' },
        gold:   { DEFAULT: '#F4A944', light: '#F9C07A' },
        cream:  '#F5F0E8',
        muted:  '#8A9BB0',
      },
      fontFamily: {
        display: ['"Clash Display"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.5rem', '3xl': '2rem' },
    },
  },
  plugins: [],
};
