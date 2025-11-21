/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4ac2d7",
        secondary: "#365456",
        dark: "#231f1f",
        panel: "#3b3a3a",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
};
