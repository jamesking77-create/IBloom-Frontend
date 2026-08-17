// Tailwind v4 reads theme tokens (brand colors, fonts) from the @theme
// block in src/index.css, not from this file — this project's Vite/PostCSS
// setup never opted back into the legacy JS config via `@config`.
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};