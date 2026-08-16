import type { Config } from 'tailwindcss'

/**
 * Color source of truth: OKLCH (see globals.css).
 * Tailwind entries use the same coordinates so bg-gold/20 stays valid.
 * Gold is one family — never mix #C9A962 and #D4B56A again.
 */
const gold = '0.78 0.09 88'
const goldLight = '0.88 0.055 88'
const goldDark = '0.62 0.10 82'

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
          DEFAULT: 'oklch(0.132 0.005 265 / <alpha-value>)',
          secondary: 'oklch(0.178 0.005 265 / <alpha-value>)',
          elevated: 'oklch(0.218 0.007 265 / <alpha-value>)',
          dark: 'oklch(0.105 0.004 265 / <alpha-value>)',
        },
        foreground: {
          DEFAULT: 'oklch(0.955 0.016 85 / <alpha-value>)',
          secondary: 'oklch(0.802 0.014 80 / <alpha-value>)',
          muted: 'oklch(0.672 0.014 75 / <alpha-value>)',
        },
        gold: {
          DEFAULT: `oklch(${gold} / <alpha-value>)`,
          light: `oklch(${goldLight} / <alpha-value>)`,
          dark: `oklch(${goldDark} / <alpha-value>)`,
        },
        rose: {
          DEFAULT: 'oklch(0.78 0.055 18 / <alpha-value>)',
          light: 'oklch(0.86 0.04 18 / <alpha-value>)',
        },
        sage: {
          DEFAULT: 'oklch(0.72 0.055 130 / <alpha-value>)',
          light: 'oklch(0.80 0.04 130 / <alpha-value>)',
        },
        success: 'oklch(0.64 0.07 150 / <alpha-value>)',
        warning: 'oklch(0.74 0.11 75 / <alpha-value>)',
        error: 'oklch(0.64 0.12 22 / <alpha-value>)',
        border: 'oklch(1 0 0 / 0.08)',
        input: 'oklch(1 0 0 / 0.1)',
        ring: `oklch(${gold} / <alpha-value>)`,
        primary: {
          DEFAULT: `oklch(${gold} / <alpha-value>)`,
          foreground: 'oklch(0.132 0.005 265 / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'oklch(0.218 0.007 265 / <alpha-value>)',
          foreground: 'oklch(0.955 0.016 85 / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'oklch(0.64 0.12 22 / <alpha-value>)',
          foreground: 'oklch(1 0 0 / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'oklch(0.218 0.007 265 / <alpha-value>)',
          foreground: 'oklch(0.70 0.012 75 / <alpha-value>)',
        },
        accent: {
          DEFAULT: `oklch(${gold} / 0.12)`,
          foreground: `oklch(${goldLight} / <alpha-value>)`,
        },
        card: {
          DEFAULT: 'oklch(0.178 0.005 265 / <alpha-value>)',
          foreground: 'oklch(0.955 0.016 85 / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'oklch(0.218 0.007 265 / <alpha-value>)',
          foreground: 'oklch(0.955 0.016 85 / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        tight: 'var(--radius-tight)',
        control: 'var(--radius-control)',
        photo: 'var(--radius-photo)',
        panel: 'var(--radius-panel)',
        lg: '0.875rem',
        md: '0.625rem',
        sm: '0.3125rem',
      },
      boxShadow: {
        soft: '0 2px 14px oklch(0 0 0 / 0.48)',
        'soft-lg': '0 10px 36px oklch(0 0 0 / 0.58)',
        gold: `0 4px 22px oklch(${gold} / 0.22)`,
        glow: `0 0 36px oklch(${gold} / 0.10)`,
      },
      transitionDuration: {
        fast: '160ms',
        base: '280ms',
        slow: '520ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.22, 1.2, 0.36, 1)',
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
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slide-in 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'scale-in': 'scale-in 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        rise: 'rise 0.52s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
