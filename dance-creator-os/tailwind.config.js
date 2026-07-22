/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#D16BA5",
          blue: "#86A8E7",
          cyan: "#5FFBF1",
          darkBg: "#090710",
          lightBg: "#FAF9FD",
          cardDark: "rgba(28, 24, 46, 0.45)",
          cardLight: "rgba(255, 255, 255, 0.82)"
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        glassLight: "0 8px 24px 0 rgba(142, 142, 142, 0.06)"
      }
    },
  },
  plugins: [],
}
