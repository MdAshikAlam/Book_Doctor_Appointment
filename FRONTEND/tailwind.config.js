/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Just in case
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E7C66',
          dark: '#0B6A59',
          light: '#F3F9F6',
        },
        healthcare: {
          blue: '#F3F9F6',
          teal: '#0E7C66',
        }
      },
    },
  },
  plugins: [],
}
