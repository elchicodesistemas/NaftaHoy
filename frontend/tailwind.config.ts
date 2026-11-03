import type { Config } from "tailwindcss";
import { BRAND_COLORS } from "./src/lib/brands";

/*
 * Paleta del redisenio. Los tokens viejos de main (surface-*, dark-*,
 * accent-amber, brand-primary) se eliminaron cuando termino la migracion de
 * componentes: ya no los referencia nadie.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Superficies
        base: "#f3f0e8",
        "base-dark": "#0e1114",
        panel: "#fffefb",
        "panel-dark": "#171b20",
        panel2: "#ebe7db",
        "panel2-dark": "#12161a",

        // Bordes
        line: "#d9d4c4",
        "line-dark": "#262c33",
        line2: "#eae6d9",
        "line2-dark": "#1e2429",

        // Escala de texto
        ink: {
          1: "#191b1e",
          2: "#383c42",
          3: "#666b73",
          4: "#94989f",
        },
        "ink-dark": {
          1: "#f2f4f6",
          2: "#c3c9d0",
          3: "#8b939c",
          4: "#5c646d",
        },

        // Suba / baja
        up: "#d43d3d",
        "up-dark": "#ff5252",
        "up-bg": "rgba(212,61,61,.10)",
        "up-bg-dark": "rgba(255,82,82,.12)",
        down: "#0e9f5c",
        "down-dark": "#2ee585",
        "down-bg": "rgba(14,159,92,.10)",
        "down-bg-dark": "rgba(46,229,133,.12)",

        // Acento
        accent: {
          DEFAULT: "#ffc400",
          ink: "#b45309",
        },

        // Petroleras (brand-ypf, brand-shell, ...).
        // Unica fuente de verdad de los colores de marca: src/lib/brands.ts
        brand: BRAND_COLORS,
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Anton", "Archivo", "Impact", "Haettenschweiler", "sans-serif"],
      },
      maxWidth: {
        content: "1240px",
      },
    },
  },
  plugins: [],
};

export default config;
