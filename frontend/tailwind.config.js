/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ Enable class-based dark mode
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
          blue: "#2563eb", 
          accent: "#1e40af",
          danger: "#dc2626",
          gray: "#f9fafb",
        },
      },
    },
  },
  plugins: [],
};
