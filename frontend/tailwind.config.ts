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
        background: {
          DEFAULT: '#0A0A0B',
          secondary: '#141416',
          elevated: '#1C1C20',
          dark: '#050506',
        },
        foreground: {
          DEFAULT: '#F5F0E8',
          secondary: '#A8A29E',
          muted: '#6B6560',
        },
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
        success: '#6B9B7A',
        warning: '#D4A051',
        error: '#D07070',
        border: 'rgba(255, 255, 255, 0.08)',
        input: 'rgba(255, 255, 255, 0.1)',
        ring: '#C9A962',
        primary: {
          DEFAULT: '#C9A962',
          foreground: '#0A0A0B',
        },
        secondary: {
          DEFAULT: '#1C1C20',
          foreground: '#F5F0E8',
        },
        destructive: {
          DEFAULT: '#D07070',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#1C1C20',
          foreground: '#A8A29E',
        },
        accent: {
          DEFAULT: 'rgba(201, 169, 98, 0.12)',
          foreground: '#E5D4A1',
        },
        card: {
          DEFAULT: '#141416',
          foreground: '#F5F0E8',
        },
        popover: {
          DEFAULT: '#1C1C20',
          foreground: '#F5F0E8',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.45)',
        'soft-lg': '0 8px 32px rgba(0,0,0,0.55)',
        gold: '0 4px 24px rgba(201, 169, 98, 0.25)',
        glow: '0 0 40px rgba(201, 169, 98, 0.12)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
