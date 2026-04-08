module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        fg: "rgb(var(--c-fg) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["General Sans", "Satoshi", "Inter", "sans-serif"],
        heading: ["Satoshi", "General Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.25)",
        "accent-glow": "0 0 24px rgba(212,175,55,0.15)",
      },
      transitionDuration: {
        200: "200ms",
        300: "300ms",
      },
    },
  },
  plugins: [],
};
