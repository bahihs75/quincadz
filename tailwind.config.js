/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
        orange: "#FF5F15",      colors: {
        primary: '#EAB308',      // mustard yellow
        secondary: '#B45309',     // warm brown
        accent: '#FEF3C7',        // cream
        // Surface layers for dark mode
        background: '#09090b',    // layer 1
        surface: '#18181b',       // layer 2 (cards)
        popup: '#27272a',         // layer 3 (popups)
      },
    },
  },
  plugins: [],
}
