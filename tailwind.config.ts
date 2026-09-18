import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TraceWorks Lab brand palette — matched to the logo (near-black
        // ground, cyan circuit-trace blue, white wordmark). Every
        // text/foreground color below is verified against `lab.bg` at WCAG
        // AA (>=4.5:1 for normal text) or better:
        //   accent  vs bg: ~8.3:1   muted vs bg: ~7.8:1
        //   warn    vs bg: ~8.1:1   danger vs bg: ~5.8:1
        lab: {
          bg: '#090c10',
          panel: '#0f141a',
          panel2: '#141b22',
          line: '#223040',
          text: '#eef3f6',
          muted: '#93a7b6',
          accent: '#2fb6e8', // TraceWorks circuit-trace cyan
          accent2: '#7fd4f2', // lighter cyan for hover/highlights
          warn: '#d99a4e',
          danger: '#e2645c',
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
