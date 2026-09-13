/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}", "./*.html"],
  theme: {
    extend: {
      fontFamily: {
        handwriting: ["Caveat", "cursive"],
        indie: ['"Indie Flower"', "cursive"],
        daughter: ['"Architects Daughter"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
