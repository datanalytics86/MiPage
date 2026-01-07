import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fondos
        background: {
          DEFAULT: '#FAF7F2',
          secondary: '#FFFFFF',
          dark: '#1A1A1A',
        },
        // Textos
        foreground: {
          DEFAULT: '#1A1A1A',
          secondary: '#525252',
          muted: '#A3A3A3',
        },
        // Acentos
        gold: {
          DEFAULT: '#C9A962',
          light: '#E5D4A1',
          dark: '#A88B3D',
        },
        rose: {
          DEFAULT: '#D4A5A5',
          light: '#E8C8C8',
        },
        sage: {
          DEFAULT: '#9CAF88',
          light: '#B8C9A8',
        },
        // Estados
        success: '#4A7C59',
        warning: '#D4A051',
        error: '#C45C5C',
        // Componentes UI
        border: '#E5E5E5',
        input: '#E5E5E5',
        ring: '#C9A962',
        primary: {
          DEFAULT: '#C9A962',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#FAF7F2',
          foreground: '#1A1A1A',
        },
        destructive: {
          DEFAULT: '#C45C5C',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#737373',
        },
        accent: {
          DEFAULT: '#FAF7F2',
          foreground: '#1A1A1A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1A1A',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0,0,0,0.06)',
        'soft-lg': '0 4px 16px rgba(0,0,0,0.08)',
        'gold': '0 4px 16px rgba(201, 169, 98, 0.2)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
