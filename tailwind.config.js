/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00fff5',
        'cyber-pink': '#ff00ff',
        'cyber-purple': '#b829ea',
        'cyber-dark': '#0a0a0f',
        'cyber-darker': '#050507',
      },
      boxShadow: {
        'neon-blue': '0 0 5px #00fff5, 0 0 20px rgba(0, 255, 245, 0.3)',
        'neon-pink': '0 0 5px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.3)',
      },
      fontFamily: {
        cyber: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};