import type { Company } from "@/data/mockPrices";
import { getSuperSpread } from "@/lib/priceUtils";

interface TrendStatsProps {
  companies: Company[];
  stats: { cheapestBrand: string; cheapestPrice: number; totalStations: number };
}

/**
 * Tarjetas laterales de la tendencia. La del rediseño decía "Próximo ajuste:
 * Agosto" a mano; se reemplaza por la más barata real que calcula el backend.
 */
export default function TrendStats({ companies, stats }: TrendStatsProps) {
  const spread = getSuperSpread(companies);
  const card =
    "flex-1 bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl px-[22px] py-5 shadow-sm dark:shadow-none flex flex-col justify-center";
  const label = "text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4";

  return (
    <div className="flex flex-col gap-4">
      <div className={card}>
        <span className={label}>Ahorro posible hoy</span>
        <span className="font-display text-[42px] leading-tight text-down dark:text-down-dark tabular-nums">
          {spread > 0 ? `$${(spread * 50).toLocaleString("es-AR")}` : "—"}
        </span>
        <span className="text-xs text-ink-3 dark:text-ink-dark-3 text-pretty">
          llenando un tanque de 50 lt en la más barata en vez de la más cara
        </span>
      </div>
      <div className={card}>
        <span className={label}>Súper más barata hoy</span>
        <span className="font-display text-[42px] leading-tight text-ink-1 dark:text-ink-dark-1 tabular-nums">
          {stats.cheapestPrice > 0 ? `$${Math.round(stats.cheapestPrice).toLocaleString("es-AR")}` : "—"}
        </span>
        <span className="text-xs text-ink-3 dark:text-ink-dark-3 text-pretty">
          {stats.cheapestBrand || "Sin datos"}
          {stats.totalStations > 0 ? ` · sobre ${stats.totalStations.toLocaleString("es-AR")} estaciones relevadas` : ""}
        </span>
      </div>
    </div>
  );
}
