/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat"],
      },
      colors: {
        primary1: "#3366CC", //presentar info importante, para apoyar la toma de decisiones (MArine)
        primary2: "#004884", //Blue dark
        primary3: "#4B4B4B", //Tundora
        primary4: "#737373", //DIM GRAY
        secondary1: "#E6EFFD", //Blue light
        secondary2: "#BABABA", //Silver
        secondary3: "#F2F2F2", //Concreto
        secondary4: "#F6F8F9", //Hawkes blue
        success: "#068460",
        waring: "#FFAB00",
        error: "#A80521",
        parrafo: "#282C34",
      },
    },
  },
  plugins: [],
};
