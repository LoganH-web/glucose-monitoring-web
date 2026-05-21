import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
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
