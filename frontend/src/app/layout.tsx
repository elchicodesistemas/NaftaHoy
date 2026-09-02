import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://naftahoy.com"),
  title: {
    default: "Nafta Hoy: precio de nafta, gasoil y GNC",
    template: "%s | NaftaHoy",
  },
  description:
    "Consultá el precio de la nafta hoy, gasoil y GNC en Argentina. Compará estaciones, encontrá la nafta más barata cerca tuyo y calculá cuánto cuesta llenar el tanque.",
  keywords: [
    "nafta hoy",
    "precio nafta hoy",
    "precio nafta",
    "precio nafta súper hoy",
    "precio nafta premium",
    "precio gasoil hoy",
    "precio gnc hoy",
    "nafta más barata",
    "nafta más barata cerca mío",
    "estaciones de servicio cerca mío",
    "cuánto cuesta llenar el tanque",
    "dónde cargar nafta",
    "donde cargo",
    "precio nafta YPF",
    "precio nafta Shell",
    "precio nafta Axion",
    "precio nafta Puma",
    "precio nafta Buenos Aires",
    "precio nafta Córdoba",
    "precio nafta Rosario",
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
    title: "Nafta Hoy: precio de nafta, gasoil y GNC",
    description:
      "Compará precios de nafta, gasoil y GNC, encontrá estaciones cerca tuyo y la nafta más barata.",
    url: "https://naftahoy.com",
    siteName: "NaftaHoy",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nafta Hoy: precio de nafta, gasoil y GNC",
    description: "Compará precios de combustibles y encontrá estaciones cerca tuyo.",
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
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
