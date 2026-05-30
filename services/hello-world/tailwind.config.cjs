module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8bd0dd",
        pink: "#e383a8",
        green: "#91dea9",
        text: "#777777"
      },
      boxShadow: {
        soft: "0 2px 6px rgba(0, 0, 0, 0.06)"
      },
      borderRadius: {
        soft: "32px"
      }
    }
  }
};
