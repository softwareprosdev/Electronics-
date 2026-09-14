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
          accent: '#7c93a8', // neutral slate blue-gray, ~6.0:1 vs bg (near-zero saturation)
          accent2: '#9aacbd', // lighter neutral slate, ~8.3:1 vs bg
          warn: '#b8935e', // muted ochre, ~6.8:1 vs bg
          danger: '#b36b62', // muted terracotta, ~4.8:1 vs bg
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      backgroundImage: {
        'circuit-grid':
          'linear-gradient(rgba(124,147,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,147,168,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,147,168,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
