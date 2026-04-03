import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./api/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: "#f6fbf6",
          100: "#e3f3e3",
          200: "#c2e3c5",
          300: "#91cd99",
          400: "#57ad67",
          500: "#388f4b",
          600: "#286d39",
          700: "#215730",
          800: "#1d4628",
          900: "#183a23"
        },
        sand: "#f4efe6",
        ink: "#17202a"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
