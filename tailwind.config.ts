import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Muted, low-glare "engineering lab" palette. Every text/foreground
        // color below is verified against `lab.bg` at WCAG AA (>=4.5:1 for
        // normal text) or better — see the contrast notes in this file's
        // history. Avoid reintroducing saturated neon accents.
        lab: {
          bg: '#0b0e12',
          panel: '#12171d',
          panel2: '#171d24',
          line: '#28323b',
          text: '#e4e9ec', // ~15.7:1 vs bg
          muted: '#a3b0b8', // ~8.7:1 vs bg
          accent: '#4fb8ab', // muted teal, ~8.0:1 vs bg (was neon mint #37e6c4)
          accent2: '#6b9bd1', // muted steel blue, ~6.6:1 vs bg (was #5ab8ff)
          warn: '#d99a52', // muted amber, ~8.0:1 vs bg
          danger: '#d97070', // muted red, ~6.0:1 vs bg
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'circuit-grid':
          'linear-gradient(rgba(79,184,171,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,184,171,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(79,184,171,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
