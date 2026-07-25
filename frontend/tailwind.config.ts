import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090412', // Deep vibrant dark violet
        foreground: '#ffffff',
        accent: {
          DEFAULT: '#ccff00', // Neon Yellow
          hover: '#b2e600',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)', // Brighter glass
          border: 'rgba(255, 255, 255, 0.15)', // More visible border
        }
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
