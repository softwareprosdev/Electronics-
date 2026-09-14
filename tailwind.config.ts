import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#06090c',
          panel: '#0d1318',
          panel2: '#121a21',
          line: '#1e2a33',
          text: '#e7edf1',
          muted: '#8fa3ad',
          accent: '#37e6c4',
          accent2: '#5ab8ff',
          warn: '#ff9d4d',
          danger: '#ff5d6c',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'circuit-grid':
          'linear-gradient(rgba(55,230,196,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(55,230,196,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(55,230,196,0.15), 0 0 24px rgba(55,230,196,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
