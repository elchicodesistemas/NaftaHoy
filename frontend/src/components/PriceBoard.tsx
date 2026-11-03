"use client";

import type { Company, FuelPrice } from "@/data/mockPrices";
import { brandColor } from "@/lib/brands";
import { getSortedBySuper, getSuperSpread, getVariacionPct } from "@/lib/priceUtils";
import BrandLogo from "./BrandLogo";

type FuelKey = "super" | "premium" | "diesel" | "gnc";

/** Busca el combustible por nombre: los tipos llegan como "Nafta Súper", "Diesel Premium", etc. */
function findFuel(company: Company, key: FuelKey): FuelPrice | undefined {
  return company.fuels.find((f) => {
    const t = f.type.toLowerCase();
    if (key === "super") return t.includes("súper") || t.includes("super");
    if (key === "premium") return t.includes("premium") && !t.includes("diesel");
    if (key === "diesel") return t.includes("diesel") && !t.includes("premium");
    return t.includes("gnc");
  });
}

function Price({ fuel, highlight }: { fuel?: FuelPrice; highlight?: boolean }) {
  return (
    <span
      className={`font-display text-xl sm:text-2xl text-right tabular-nums ${
        highlight ? "text-down dark:text-down-dark" : "text-ink-1 dark:text-ink-dark-1"
      }`}
    >
      {fuel && fuel.price > 0 ? `$${fuel.price.toLocaleString("es-AR")}` : "—"}
    </span>
  );
}

const headerCell = "text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 text-right";
const cols = "grid grid-cols-[1.6fr_1fr_.9fr] sm:grid-cols-[2fr_1fr_1fr_1fr_.9fr] lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_.9fr]";

interface PriceBoardProps {
  companies: Company[];
  zoneLabel: string;
  todayLabel: string;
  sourceLabel: string;
  loading?: boolean;
  officialData?: boolean;
}

/**
 * "La pizarra" del rediseño, alimentada con `data.companies` de la API.
 * Reemplaza a la grilla de tarjetas PriceTable + pestañas de combustible.
 */
export default function PriceBoard({ companies, zoneLabel, todayLabel, sourceLabel, loading, officialData }: PriceBoardProps) {
  const sorted = getSortedBySuper(companies);
  const spread = getSuperSpread(companies);

  return (
    <section id="precios" className="max-w-content mx-auto px-4 sm:px-6 pt-9 pb-2 scroll-mt-20">
      {/* Frase clave para SEO que en main era el h1 de la portada */}
      <p className="text-[13px] font-bold tracking-[.14em] uppercase text-accent-ink dark:text-accent mb-1">Precio de la nafta hoy</p>
      <div className="flex items-baseline justify-between mb-1 gap-2 flex-wrap">
        <h2 className="font-display text-[30px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">La pizarra</h2>
        <span className="text-xs font-medium text-ink-4 dark:text-ink-dark-4">{loading ? "Actualizando…" : zoneLabel}</span>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-5">
        <p className="text-xs text-ink-4 dark:text-ink-dark-4">
          <span className="first-letter:uppercase inline-block">{todayLabel}</span> · precio por litro · {sourceLabel}
        </p>
        {officialData && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase text-down dark:text-down-dark bg-down-bg dark:bg-down-bg-dark px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-live-blink" />
            Datos oficiales
          </span>
        )}
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className={`${cols} px-4 sm:px-[22px] py-3 border-b border-line dark:border-line-dark bg-panel2 dark:bg-panel2-dark`}>
          <span className={`${headerCell} text-left`}>Petrolera</span>
          <span className={headerCell}>Súper</span>
          <span className={`${headerCell} hidden sm:block`}>Premium</span>
          <span className={`${headerCell} hidden sm:block`}>Diesel</span>
          <span className={`${headerCell} hidden lg:block`}>GNC</span>
          <span className={headerCell}>Variación</span>
        </div>

        {sorted.length === 0 && (
          <p className="px-[22px] py-6 text-sm text-ink-3 dark:text-ink-dark-3">
            No hay precios oficiales disponibles todavía para esta zona.
          </p>
        )}

        {sorted.map((company, i) => {
          const superFuel = findFuel(company, "super") ?? company.fuels[0];
          const pct = superFuel ? getVariacionPct(superFuel) : 0;
          const up = pct >= 0;
          const isCheapest = i === 0 && sorted.length > 1;
          return (
            <div
              key={company.id}
              className={`${cols} items-center px-4 sm:px-[22px] py-4 hover:bg-panel2 dark:hover:bg-panel2-dark transition-colors ${
                i < sorted.length - 1 ? "border-b border-line2 dark:border-line2-dark" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <span className="w-1 h-[34px] rounded-sm shrink-0" style={{ background: brandColor(company.id) }} />
                <BrandLogo brand={company.id} size={32} />
                <div className="min-w-0">
                  <span className="block text-sm sm:text-[15px] font-bold text-ink-1 dark:text-ink-dark-1 truncate">{company.name}</span>
                  {isCheapest && (
                    <span className="text-[11px] font-bold tracking-wide text-down dark:text-down-dark">MÁS BARATA HOY</span>
                  )}
                </div>
              </div>
              <Price fuel={superFuel} highlight={isCheapest} />
              <span className="hidden sm:block text-right"><Price fuel={findFuel(company, "premium")} /></span>
              <span className="hidden sm:block text-right"><Price fuel={findFuel(company, "diesel")} /></span>
              <span className="hidden lg:block text-right"><Price fuel={findFuel(company, "gnc")} /></span>
              <span className="text-right">
                <span
                  className={`inline-block text-xs font-bold px-2 sm:px-2.5 py-1 rounded-md ${
                    up
                      ? "text-up dark:text-up-dark bg-up-bg dark:bg-up-bg-dark"
                      : "text-down dark:text-down-dark bg-down-bg dark:bg-down-bg-dark"
                  }`}
                >
                  {up ? "+" : ""}
                  {pct.toFixed(1).replace(".", ",")}%
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {spread > 0 && (
        <p className="mt-2.5 mx-1 text-[11px] text-ink-4 dark:text-ink-dark-4">
          Nafta Súper en {zoneLabel.toLowerCase().startsWith("zona") ? zoneLabel.slice(6) : "esta zona"}: la diferencia entre la más barata y la más cara hoy es de{" "}
          <span className="text-accent-ink dark:text-accent font-bold">${spread.toLocaleString("es-AR")} por litro</span> — unos $
          {(spread * 50).toLocaleString("es-AR")} en un tanque de 50 litros.
        </p>
      )}
    </section>
  );
}
