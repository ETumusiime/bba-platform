/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb", // Primary Blue
          accent: "#1e40af",
          danger: "#dc2626",
          gray: "#f9fafb",
        },
      },
    },
  },
  plugins: [],
};
