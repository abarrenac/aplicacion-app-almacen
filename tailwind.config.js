/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        brand: {
          orange: '#F97316',
          amber: '#F59E0B',
          dark: '#0F0F0F',
          panel: '#161616',
          border: '#2A2A2A',
          muted: '#3A3A3A',
        }
      },
    },
  },
  plugins: [],
};
