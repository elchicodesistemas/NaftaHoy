import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NaftaHoy — Precios de Combustibles en Argentina",
  description:
    "Consultá los precios actualizados de nafta, diésel y GNC de YPF, Shell, Axion, Puma y más. Compará precios por zona y seguí la evolución histórica.",
  keywords: [
    "nafta hoy",
    "precio nafta",
    "combustibles argentina",
    "precio nafta hoy",
    "YPF precios",
    "Shell precios",
    "Axion precios",
    "precio diesel",
    "GNC precio",
  ],
  openGraph: {
    title: "NaftaHoy — Precios de Combustibles en Argentina",
    description:
      "Precios actualizados de nafta, diésel y GNC de todas las petroleras.",
    url: "https://naftahoy.com",
    siteName: "NaftaHoy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-base dark:bg-base-dark text-ink-2 dark:text-ink-dark-2 font-sans antialiased min-h-screen transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
