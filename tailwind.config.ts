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
          DEFAULT: "#68458C",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#E3D4F3",
        },
        background: {
          DEFAULT: "#F2F4FF",
        },
        additional: {
          DEFAULT: "#D5F2F4",
        },
        tags: {
          DEFAULT: "#FB98CC",
        },
        grey: {
          DEFAULT: "#9E9E9E",
          light: "#E3D4F3",
          dark: "#68458C",
        },
        // Legacy support - map old names to new colors
        purple: {
          DEFAULT: "#68458C",
          light: "#E3D4F3",
        },
        "mini-app-background": "#E3D4F3",
        "mini-app-bg": "#F2F4FF",
        "mini-app-icon-bg": "#E3D4F3",
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

