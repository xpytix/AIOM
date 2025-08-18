/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Definiujemy naszą niestandardową paletę kolorów
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Główny kolor akcentowy
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Możesz tu dodać inne kolory, np. secondary, accent
      },
      // Definiujemy niestandardową, nowoczesną czcionkę
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Ustawiamy 'Inter' jako domyślną czcionkę
      },
    },
  },
  plugins: [],
}