import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#000A35",
          dark: "#000A35",
          foreground: "#ffffff",
        },
        purple: {
          DEFAULT: "#7549EA",
          light: "#AB57ED",
        },
        magenta: "#AB57ED",
        mint: "#71ECCA",
        teal: "#00BDD1",
        grey: {
          DEFAULT: "#9E9E9E",
          light: "#e5e5e5",
          dark: "#6b6b6b",
        },
        "mini-app-background": "#EFEEFC", // Card background - light purple
        "mini-app-bg": "#DFE0ED", // Main background - light lavender gray
        "mini-app-icon-bg": "#DBD5F8", // Icon container background
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;

