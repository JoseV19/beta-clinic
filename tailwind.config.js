/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'omega-violet': '#6A1B9A',
        'omega-dark': '#4A148C',
        'omega-abyss': '#0B0613',
        'omega-surface': '#1A1030',
        'beta-mint': 'var(--color-accent, #7FFFD4)',
        'clinical-white': '#F8F9FA',
        'alert-red': '#E53935',
      },
    },
  },
  plugins: [],
}
