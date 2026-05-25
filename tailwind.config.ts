import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:     { DEFAULT: '#1A56DB', hover: '#1447c0' },
        secondary:   { DEFAULT: '#0EA5E9' },
        success:     { DEFAULT: '#16A34A' },
        warning:     { DEFAULT: '#D97706' },
        danger:      { DEFAULT: '#DC2626' },
        destructive: { DEFAULT: '#DC2626' },
        background:  '#F8FAFC',
        muted: {
          DEFAULT:    '#E2E8F0',
          foreground: '#64748B',
        },
        bg: {
          DEFAULT: '#F8FAFC',
          card:    '#FFFFFF',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '12px',
        '3xl': '24px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.06)',
        panel: '0 8px 40px rgba(0,0,0,0.10)',
        glow:  '0 8px 20px rgba(26,86,219,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
