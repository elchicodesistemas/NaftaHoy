import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NaftaHoy — Precios de Combustibles en Tiempo Real",
    short_name: "NaftaHoy",
    description: "Portal de precios de nafta, diésel y GNC en Argentina.",
    start_url: "/",
    display: "standalone",
    background_color: "#111117",
    theme_color: "#e8a849",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
