"use client";

import type { Company } from "@/data/mockPrices";
import { brandColor } from "@/lib/brands";
import { getVariacionPct } from "@/lib/priceUtils";

/**
 * Cinta de precios en movimiento. Portado del rediseño, pero alimentado con
 * los datos reales que bajan de la API (`data.companies`) en vez de mocks.
 */
export default function Ticker({ companies }: { companies: Company[] }) {
  const items = companies.flatMap((c) =>
    c.fuels.slice(0, 2).map((fuel) => ({
      brand: c.id,
      label: `${c.shortName} ${fuel.type}`,
      fuel,
    })),
  );

  // Con muy pocos datos la cinta queda vacía o entrecortada: mejor no mostrarla.
  if (items.length < 3) return null;

  const loop = [
    ...items.map((item) => ({ ...item, key: `a-${item.brand}-${item.fuel.type}` })),
    ...items.map((item) => ({ ...item, key: `b-${item.brand}-${item.fuel.type}` })),
  ];

  return (
    <div
      className="bg-panel2 dark:bg-panel2-dark border-b border-line2 dark:border-line2-dark overflow-hidden py-2"
      aria-label="Precios en vivo"
    >
      <div className="flex gap-11 whitespace-nowrap w-max animate-marquee">
        {loop.map((item) => {
          const pct = getVariacionPct(item.fuel);
          const up = pct >= 0;
          return (
            <span key={item.key} className="text-xs font-semibold tracking-wide">
              <span style={{ color: brandColor(item.brand) }}>■</span> {item.label}{" "}
              <span className="text-ink-1 dark:text-ink-dark-1 tabular-nums">
                ${item.fuel.price.toLocaleString("es-AR")}
              </span>{" "}
              <span
                className={
                  up ? "text-up dark:text-up-dark" : "text-down dark:text-down-dark"
                }
              >
                {up ? "+" : ""}
                {pct.toFixed(1).replace(".", ",")}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
