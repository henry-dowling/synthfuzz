import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'ibm-plex': ['var(--font-ibm-plex)', 'monospace'],
        'georgia': ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config 