/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/pages/**/*.{vue,js,ts}', './app/components/**/*.{vue,js,ts}'],
  theme: {
    extend: {}
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light'],
    darkTheme: 'light'
  }
}