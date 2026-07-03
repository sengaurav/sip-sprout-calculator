/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        grape: "#7C3AED",
        leaf: "#16A34A",
        sun: "#EAB308",
        berry: "#DC2626",
        sky: "#2563EB",
        violet2: "#8B5CF6",
        cream: "#FFFDF9",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        blob: "40% 60% 60% 40% / 60% 40% 60% 40%",
      },
    },
  },
  plugins: [],
};
