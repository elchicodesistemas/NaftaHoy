import type { Config } from "tailwindcss";
import { BRAND_COLORS } from "./src/lib/brands";

/*
 * Paleta en transicion. Conviven dos sistemas a proposito:
 *
 *  - Tokens viejos (surface-*, dark-*, accent-amber, brand-primary): los que
 *    usan hoy los componentes de main. NO se tocan todavia; sacarlos ahora
 *    dejaria el sitio sin estilos.
 *  - Tokens del redisenio (base, panel, line, ink-*, accent, up/down,
 *    brand-ypf...): se suman ahora para poder migrar componente por componente.
 *
 * Cuando no quede ningun componente usando los viejos, se borran de aca.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // --- Sistema viejo (main). Se elimina cuando no lo use nadie. ---
        surface: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e8e8ec",
          300: "#d4d4d8",
        },
        dark: {
          bg: "#111117",
          surface: "#1a1a24",
          card: "#1f2029",
          border: "#2a2b38",
        },

        // --- Sistema nuevo (redisenio) ---
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

        // Acento: DEFAULT es el del redisenio (bg-accent), y se conservan los
        // pasteles de main (bg-accent-amber, text-accent-red, ...).
        accent: {
          DEFAULT: "#ffc400",
          ink: "#b45309",
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

        // Petroleras (brand-ypf, brand-shell, ...) + los dos tokens de main.
        // Unica fuente de verdad de los colores de marca: src/lib/brands.ts
        brand: {
          ...BRAND_COLORS,
          primary: "#e8a849",
          dark: "#c48930",
        },
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Anton", "Archivo", "Impact", "Haettenschweiler", "sans-serif"],
      },
      maxWidth: {
        // El redisenio usa 1240px. Se cambia al migrar los componentes, para
        // que esta etapa no mueva la geometria de las paginas actuales.
        content: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
