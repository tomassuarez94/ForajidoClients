/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forajidoGold: '#FFD166',
        forajidoBlack: '#0A0A0A',
        forajidoPurple: '#3A0CA3',
        forajidoWine: '#5F0F40',
        forajidoSmoke: '#F5F5F5',
      },
      backgroundImage: {
        'forajido-premium': 'linear-gradient(to bottom right, #0A0A0A, #1A120B, #BFA76F)',
      },
    }

  },
  plugins: [],
}
