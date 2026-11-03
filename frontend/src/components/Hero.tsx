"use client";

import type { Company } from "@/data/mockPrices";
import { averageByFuelName } from "@/lib/priceUtils";

interface HeroProps {
  companies: Company[];
  stats: { superAvg: number; totalStations?: number };
  province?: string;
  isRealData?: boolean;
}

/**
 * Portada del rediseño, alimentada con los datos reales de la API.
 * El promedio de Súper viene calculado del backend (`stats.superAvg`);
 * el resto se promedia sobre lo que efectivamente devolvió la consulta.
 */
export default function Hero({ companies, stats, province, isRealData }: HeroProps) {
  const rawDate = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  // Sólo la primera letra en mayúscula: `capitalize` de Tailwind haría
  // "Viernes 28 De Agosto".
  const dateStr = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const zona = province ? province : "todo el país";

  const rows = [
    { label: "Súper", value: stats.superAvg, highlight: true },
    { label: "Premium", value: averageByFuelName(companies, "Nafta Premium") },
    { label: "Diesel", value: averageByFuelName(companies, "Diesel") },
    { label: "GNC", value: averageByFuelName(companies, "GNC") },
  ].filter((row) => row.highlight || row.value > 0);

  return (
    <header className="border-b border-line dark:border-line-dark bg-[radial-gradient(ellipse_900px_420px_at_20%_-10%,rgba(255,196,0,.20),transparent)] dark:bg-[radial-gradient(ellipse_900px_420px_at_20%_-10%,rgba(255,196,0,.07),transparent)]">
      <div className="max-w-content mx-auto px-4 sm:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 md:gap-12 items-center">
        <div>
          <p className="mb-3.5 text-[13px] font-bold tracking-[.14em] uppercase text-accent-ink dark:text-accent">
            {dateStr} · {zona}
          </p>

          <h1 className="font-display text-[44px] sm:text-6xl md:text-[76px] leading-[.95] uppercase text-ink-1 dark:text-ink-dark-1 text-balance">
            ¿Cuánto sale llenar el tanque hoy?
          </h1>

          <p className="mt-5 text-base leading-relaxed text-ink-3 dark:text-ink-dark-3 max-w-[480px] text-pretty">
            Precios de nafta, diésel y GNC de todas las petroleras, tomados del dataset
            oficial de la Secretaría de Energía y completados con reportes de la comunidad.
          </p>

          <div className="flex flex-wrap gap-3 mt-7">
            <a
              href="#precios"
              className="inline-flex items-center gap-2 px-[22px] py-3 rounded-lg bg-accent text-[#141414] text-sm font-bold uppercase tracking-wide hover:brightness-110 transition-[filter]"
            >
              Ver la pizarra
            </a>
            <a
              href="#mapa"
              className="inline-flex items-center gap-2 px-[22px] py-3 rounded-lg border border-line dark:border-line-dark text-ink-2 dark:text-ink-dark-2 text-sm font-bold uppercase tracking-wide hover:border-accent-ink dark:hover:border-accent hover:text-accent-ink dark:hover:text-accent transition-colors"
            >
              Estaciones cerca
            </a>
          </div>

          {typeof stats.totalStations === "number" && stats.totalStations > 0 && (
            <p className="mt-5 text-xs text-ink-4 dark:text-ink-dark-4 tabular-nums">
              {stats.totalStations.toLocaleString("es-AR")} estaciones relevadas
              {isRealData ? " · datos oficiales" : ""}
            </p>
          )}
        </div>

        <div className="rounded-2xl overflow-hidden border border-line dark:border-line-dark shadow-[0_24px_60px_rgba(0,0,0,.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,.45)] bg-panel dark:bg-panel-dark">
          <div className="px-[22px] py-3.5 bg-accent flex items-center justify-between">
            <span className="font-display text-base tracking-wide uppercase text-[#141414]">
              Promedio {province || "nacional"}
            </span>
            <span className="text-[11px] font-bold text-[#141414]/70">HOY</span>
          </div>

          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`px-[22px] py-2 flex items-center justify-between gap-3 ${
                i < rows.length - 1 ? "border-b border-line2 dark:border-line2-dark" : "pb-3"
              }`}
            >
              <span className="text-sm font-semibold uppercase tracking-wide text-ink-4 dark:text-ink-dark-4">
                {row.label}
              </span>
              <span
                className={`font-display text-[38px] sm:text-[44px] tabular-nums leading-none ${
                  row.highlight
                    ? "text-accent-ink dark:text-accent"
                    : "text-ink-1 dark:text-ink-dark-1"
                }`}
              >
                {row.value > 0
                  ? `$${row.value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
