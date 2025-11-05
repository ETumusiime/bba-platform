/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bbaBlue: "#1D4ED8",
        bbaGold: "#FBBF24",
        bbaGray: "#F3F4F6",
      },
    },
  },
  plugins: [],
};
