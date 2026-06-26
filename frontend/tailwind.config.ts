/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        chocolate: { DEFAULT: "#3d2314", light: "#5c3d2e", dark: "#1a1209" },
        gold: { DEFAULT: "#d4af37", light: "#e8c547", dark: "#b8941f" },
        cream: { DEFAULT: "#faf7f4", dark: "#f0e8df" },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
