import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL("https://naftahoy.com"),
  title: {
    default: "NaftaHoy — Precios de Combustibles en Tiempo Real en Argentina",
    template: "%s | NaftaHoy",
  },
  description:
    "Consultá precios oficiales disponibles de nafta súper, premium, diésel y GNC en Argentina. Comparador, mapa de estaciones y calculadora de tanque.",
  keywords: [
    "precio nafta hoy",
    "precio nafta argentina",
    "combustibles argentina",
    "ypf precios",
    "shell precios",
    "axion precios",
    "puma energy precios",
    "precio diesel hoy",
    "precio gnc hoy",
    "calculadora nafta argentina",
    "estaciones de servicio cercanas",
    "mapa precios combustibles",
  ],
  authors: [{ name: "NaftaHoy" }],
  creator: "NaftaHoy",
  publisher: "NaftaHoy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://naftahoy.com",
  },
  openGraph: {
    title: "NaftaHoy — Precios de Combustibles en Tiempo Real en Argentina",
    description:
      "Mirá y compará precios de nafta súper, premium, diésel y GNC de estaciones de toda la Argentina.",
    url: "https://naftahoy.com",
    siteName: "NaftaHoy",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NaftaHoy — Precios de Combustibles en Tiempo Real",
    description: "Portal de precios de combustibles en Argentina.",
    creator: "@naftahoy",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <JsonLd />
      </head>
      <body className="bg-surface-50 text-zinc-800 dark:bg-dark-bg dark:text-zinc-200 font-sans antialiased min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
