/** @type {import('tailwindcss').Config} */
module.exports = {
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
