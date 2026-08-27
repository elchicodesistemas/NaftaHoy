import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Modo claro
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e8e8ec",
          300: "#d4d4d8",
        },
        // Modo oscuro
        dark: {
          bg: "#111117",
          surface: "#1a1a24",
          card: "#1f2029",
          border: "#2a2b38",
        },
        // Acentos pasteles
        accent: {
          amber: "#e8a849",
          "amber-soft": "#f6c177",
          red: "#e87171",
          "red-soft": "#f0a0a0",
          green: "#5cb07a",
          "green-soft": "#a3d9a5",
          blue: "#5b8fd9",
          "blue-soft": "#89b4fa",
          purple: "#9b7fcc",
          cyan: "#4fb8a6",
        },
        brand: {
          primary: "#e8a849",
          dark: "#c48930",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
