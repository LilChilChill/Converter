/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{tsx,ts,jsx,js}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#09090f',
          1: '#111118',
          2: '#18181f',
          3: '#22222b'
        },
        border: '#2a2a36',
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#a78bfa'
        },
        success: '#22c55e',
        error: '#ef4444',
        warn: '#f59e0b'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
