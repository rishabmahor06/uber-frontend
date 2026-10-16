/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        primary: "#000000",
        secondary: "#d5622d",
        brand: {
          navy: "#0b1437",
          forest: "#0b3d1e",
          lime: "#8ae02c",
          limeDark: "#6fc018",
          mint: "#eef6ee",
        },
      },
    },
  },
  plugins: [],
};
