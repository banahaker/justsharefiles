/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        "silver-bg": "var(--color-bg-primary)",
        "silver-surface": "var(--color-bg-secondary)",
        "silver-text": "var(--color-text-primary)",
        "silver-brand": "var(--color-brand-primary)",
        "silver-accent": "var(--color-brand-accent)",
      },
      boxShadow: {
        silver: "var(--shadow-silver)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
      },
      letterSpacing: {
        widest: "0.05em",
      },
    },
  },
  plugins: [],
};
