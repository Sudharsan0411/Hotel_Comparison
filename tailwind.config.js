/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        ocean: '#2563eb',
        mint: '#10b981',
        coral: '#f97316',
        violet: '#7c3aed'
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
        panel: '0 10px 30px rgba(15, 23, 42, 0.06)'
      }
    }
  },
  plugins: []
};
