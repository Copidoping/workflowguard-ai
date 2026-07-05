import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7faf8",
        moss: "#2f6f5e",
        coral: "#d45c4a",
        amberline: "#d79c35"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
