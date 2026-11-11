/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        tc: ['"Noto Sans TC"', '"Microsoft JhengHei"', 'sans-serif'],
        kaiti: ['"Noto Serif TC"', '"DFKai-SB"', '"BiauKai"', 'serif'],
      },
    },
  },
  plugins: [],
}

