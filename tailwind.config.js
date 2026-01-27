/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: '#002a5e',
        electricBlue: '#0074ff',
        neonGreen: '#00ff85',
        championshipYellow: '#ffdd00',
      },
    },
  },
  plugins: [],
}
