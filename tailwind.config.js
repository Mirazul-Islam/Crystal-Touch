/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary blue ramp — sampled from the Crystal Touch logo facets.
        brand: {
          50: '#eef6fd',
          100: '#d6eafb',
          200: '#b0d6f5',
          300: '#7cbef0',
          400: '#3fb4e6',
          500: '#2e9be0',
          600: '#1c6fd6',
          700: '#155fb0',
          800: '#0e4fa1',
          900: '#0b2e59',
          950: '#07203f',
        },
        // Cyan / teal accent — the logo sparkles.
        accent: {
          50: '#ecfdfd',
          100: '#cff9f9',
          200: '#a6f0ec',
          300: '#7ce9e6',
          400: '#5fe0df',
          500: '#15b5c4',
          600: '#119aa8',
          700: '#127c89',
          800: '#14636e',
          900: '#15515b',
          950: '#06333a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1200px',
        },
      },
    },
  },
  plugins: [],
};
