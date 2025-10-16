/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cambridgeBlue: "#002147",
        cambridgeGold: "#D4AF37",
      },
      fontFamily: {
        cambria: ["Cambria", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
