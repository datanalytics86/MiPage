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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
        },
        // Dark Theme Palette
        dark: {
          950: '#0a0a0a',
          900: '#1a1a1a',
          850: '#1f1f1f',
          800: '#262626',
          700: '#404040',
          600: '#525252',
          500: '#737373',
        },
        // Fire Palette (warm oranges)
        fire: {
          50: '#fff5f0',
          100: '#ffe4d6',
          200: '#ffc9ad',
          300: '#ffa87a',
          400: '#ff8647',
          500: '#ff6b35',
          600: '#e64f1f',
          700: '#cc3d15',
          800: '#b33000',
          900: '#992800',
        },
        // Lust Palette (deep reds)
        lust: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Warm Grays
        warm: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
          950: '#fecaca',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-fire': 'pulseFire 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 107, 53, 0.5), 0 0 10px rgba(255, 107, 53, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(255, 107, 53, 0.8), 0 0 20px rgba(255, 107, 53, 0.5)' },
        },
        pulseFire: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
      },
      boxShadow: {
        'fire': '0 4px 14px 0 rgba(255, 107, 53, 0.39)',
        'fire-lg': '0 8px 24px 0 rgba(255, 107, 53, 0.5)',
        'lust': '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
        'lust-lg': '0 8px 24px 0 rgba(239, 68, 68, 0.5)',
        'dark': '0 4px 20px 0 rgba(0, 0, 0, 0.5)',
        'dark-lg': '0 8px 30px 0 rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
        'gradient-fire': 'linear-gradient(135deg, #ff6b35 0%, #e64f1f 100%)',
        'gradient-lust': 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
