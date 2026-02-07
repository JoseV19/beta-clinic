/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'omega-violet': 'var(--color-primary, #7C3AED)',
        'omega-dark': '#4A148C',
        'omega-abyss': '#0B0613',
        'omega-surface': '#1A1030',
        'beta-mint': 'var(--color-accent, #7FFFD4)',
        'clinical-white': '#F8F9FA',
        'alert-red': '#E53935',
        'theme-primary': 'var(--color-primary, #7C3AED)',
        'theme-accent': 'var(--color-accent, #7FFFD4)',
      },
    },
  },
  plugins: [],
}
