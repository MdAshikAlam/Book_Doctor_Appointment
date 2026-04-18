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
          DEFAULT: '#0d6efd',
          dark: '#0a58ca',
          light: '#3d8bfd',
        },
        healthcare: {
          blue: '#e7f1ff',
          teal: '#20c997',
        }
      },
    },
  },
  plugins: [],
}
