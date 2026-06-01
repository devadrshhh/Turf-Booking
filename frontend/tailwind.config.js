/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#ffffff',
          light: '#f8fbff',
          highlight: '#e6f4ff',
          border: '#bfe3ff',
          accent: '#4da6ff',
          accentHover: '#3399ff',
          accentGlow: 'rgba(77, 166, 255, 0.15)',
          textDark: '#111827',
          textSecondary: '#4b5563',
          textMuted: '#9ca3af',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.02)',
        premium: '0 8px 30px rgba(0, 0, 0, 0.04)',
        glow: '0 0 0 3px rgba(77, 166, 255, 0.2)',
      }
    },
  },
  plugins: [],
}
