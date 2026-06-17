/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          900: "#1e1b4b",
        },
        surface: {
          900: "#050816",
          800: "#0A0F1E",
          700: "#101827",
          600: "#1F2937",
        },
        ongc: {
          primary: "#FF6B35",
          secondary: "#FF8C42",
          accent1: "#00E5A8",
          accent2: "#3B82F6",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
