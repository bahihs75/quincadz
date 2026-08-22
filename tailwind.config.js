/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5C400',
        secondary: '#242424',
        dark: '#111111',
        'dark-elevated': '#242424',
        'text-tertiary': '#777777',
        'border-default': '#D8D4CB',
        'border-active': '#F5C400',
        success: '#234F32',
        warning: '#F5C400',
        error: '#C62828',
        info: '#3F6475',
        disabled: '#B5B5B5',
      },
    },
  },
  plugins: [],
}
