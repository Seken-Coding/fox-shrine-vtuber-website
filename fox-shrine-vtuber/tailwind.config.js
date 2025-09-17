/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'shrine-red': '#8C1C13',
        'fox-orange': '#D96704',
        'shrine-gold': '#F2A71B',
        'shrine-white': '#F2F2F2',
        'shrine-dark': '#262626',
        // Dark mode specific colors
        'dark-bg': '#0F0F0F',
        'dark-card': '#1A1A1A',
        'dark-border': '#2D2D2D',
        'dark-text': '#E5E5E5',
        'dark-text-secondary': '#B3B3B3',
        'dark-shrine-red': '#B23A2F',
        'dark-fox-orange': '#FF8A3D',
        'dark-shrine-gold': '#FFD700',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.5s ease-out'
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      backgroundImage: {
        'shrine-pattern': "url('/src/assets/images/pattern.png')",
      }
    },
  },
  plugins: [],
}