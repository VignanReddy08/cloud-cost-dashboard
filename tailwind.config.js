/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // A premium black-purple aesthetic replacing the default gray
        gray: {
          50: '#faf6fc',
          100: '#f0e8f7',
          200: '#dac7ed',
          300: '#b596da',
          400: '#8b60c2',
          500: '#643ca1',
          600: '#482780',
          700: '#311959',   // Borders
          800: '#1d0e36',   // Card Hover/Lighter Elements
          900: '#120924',   // Cards and Panels
          950: '#090414',   // Deep Background
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
