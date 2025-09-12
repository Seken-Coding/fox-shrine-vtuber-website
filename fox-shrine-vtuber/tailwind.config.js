/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'shrine-red': '#C41E3A',
        'fox-orange': '#FF9500',
        'shrine-teal': '#5FB4A2',
        'shrine-white': '#F5F1E8',
        'shrine-dark': '#333333',
        'shrine-gold': '#FFD700',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'nunito': ['Nunito', 'sans-serif'],
        'satisfy': ['Satisfy', 'cursive'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'shrine-pattern': "url('/src/assets/images/pattern.png')",
      }
    },
  },
  plugins: [],
}