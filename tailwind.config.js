/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6ECFF',
          100: '#CCDAFF',
          200: '#99B5FF',
          300: '#668FFF',
          400: '#336AFF',
          500: '#3366FF',
          600: '#0033CC',
          700: '#002699',
          800: '#001A66',
          900: '#000D33',
        },
        secondary: {
          50: '#E6FFFD',
          100: '#CCFEFB',
          200: '#99FDF7',
          300: '#66FBF3',
          400: '#33FAEF',
          500: '#00B8A9',
          600: '#00A699',
          700: '#007D73',
          800: '#00534D',
          900: '#002A26',
        },
        accent: {
          50: '#F5F3FF',
          100: '#EAE5FF',
          200: '#D6CCFF',
          300: '#B399FF',
          400: '#9980FF',
          500: '#7B68EE',
          600: '#6247D9',
          700: '#4935A6',
          800: '#312473',
          900: '#191239',
        },
        success: {
          500: '#4CAF50',
        },
        warning: {
          500: '#FF9800',
        },
        error: {
          500: '#F44336',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
};