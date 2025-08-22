/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors if needed
        dark: {
          bg: '#0e1117',
          card: '#161b22',
          border: '#30363d'
        }
      }
    },
  },
  plugins: [],
}