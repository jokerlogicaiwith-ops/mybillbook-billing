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
          sidebar: '#131b2e',
          sidebarActive: '#263450',
          blue: '#1e40af',
          lightBlue: '#3b82f6',
          bg: '#f8fafc',
          border: '#e2e8f0',
          primary: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
