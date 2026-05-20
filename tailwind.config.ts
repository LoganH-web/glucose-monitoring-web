import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        surface: {
          900: "#0d1611",
          800: "#131e19",
          700: "#1b2b23",
          600: "#223529",
          border: "#2a3f34",
        },
      },
    },
  },
  plugins: [],
};

export default config;
