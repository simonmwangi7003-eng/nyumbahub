/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef7f2', 100: '#d5ece0', 200: '#aad8c1', 300: '#74bc9b', 400: '#3f9c74', 500: '#1f8159', 600: '#0b6b4a', 700: '#0a563c', 800: '#0b4531', 900: '#0a3a2a', 950: '#05211a' },
        laterite: { 50: '#fcf1ed', 100: '#f8ddd3', 500: '#c2512f', 600: '#a8431f', 700: '#873519' },
        ink: '#0e1a15',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
