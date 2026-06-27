/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefcfb',
          100: '#d4f6f4',
          200: '#aeece9',
          300: '#77ddda',
          400: '#3ec5c3',
          500: '#1ba9a8',
          600: '#138888',
          700: '#136d6e',
          800: '#155759',
          900: '#16494b',
          950: '#062b2d',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc070',
          400: '#ff9c37',
          500: '#fe7e11',
          600: '#ef6307',
          700: '#c64a08',
          800: '#9d3a0f',
          900: '#7e3210',
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
