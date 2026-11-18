import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        court: {
          50: "#f4fbf4",
          100: "#ddf3de",
          200: "#bee7c0",
          300: "#93d497",
          400: "#5cb564",
          500: "#37933f",
          600: "#276f2f",
          700: "#1f5927",
          800: "#1b4621",
          900: "#173a1d"
        },
        clay: {
          50: "#fff6ef",
          100: "#fee9d7",
          200: "#fdd0af",
          300: "#fbb07c",
          400: "#f78244",
          500: "#f0611f",
          600: "#e14814",
          700: "#ba3413",
          800: "#942b17",
          900: "#782616"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 24, 40, 0.12)"
      },
      backgroundImage: {
        "court-grid":
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
