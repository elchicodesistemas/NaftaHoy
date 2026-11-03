"use client";

interface StatsProps {
  stats?: {
    superAvg: number;
    variationPct: number;
    cheapestBrand: string;
    cheapestPrice: number;
    mostExpensiveBrand: string;
    mostExpensivePrice: number;
    totalStations?: number;
  };
}

export default function StatsBar({ stats }: StatsProps) {
  const hasData = Boolean(stats && stats.superAvg > 0);
  const variationUp = hasData && stats!.variationPct >= 0;

  const superAvg = hasData ? `$${stats!.superAvg.toLocaleString("es-AR")}` : "—";
  const variation = hasData
    ? `${variationUp ? "+" : ""}${String(stats!.variationPct).replace(".", ",")}%`
    : "—";
  const cheapestBrand = hasData ? stats!.cheapestBrand : "—";
  const cheapestSub = hasData ? `$${stats!.cheapestPrice.toLocaleString("es-AR")} por litro` : "sin datos";
  const mostExpensiveBrand = hasData ? stats!.mostExpensiveBrand : "—";
  const mostExpensiveSub = hasData
    ? `$${stats!.mostExpensivePrice.toLocaleString("es-AR")} por litro`
    : "sin datos";

  const statItems = [
    {
      label: "Nafta Súper",
      value: superAvg,
      sub: "promedio",
      tone: "text-accent-ink dark:text-accent",
      display: true,
    },
    {
      label: "Variación",
      value: variation,
      sub: "respecto del precio anterior",
      tone: variationUp ? "text-up dark:text-up-dark" : "text-down dark:text-down-dark",
      display: true,
    },
    {
      label: "Más barata",
      value: cheapestBrand,
      sub: cheapestSub,
      tone: "text-down dark:text-down-dark",
      display: false,
    },
    {
      label: "Más cara",
      value: mostExpensiveBrand,
      sub: mostExpensiveSub,
      tone: "text-up dark:text-up-dark",
      display: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="bg-panel dark:bg-panel-dark rounded-xl border border-line dark:border-line-dark px-4 py-3"
        >
          <span className="block text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4">
            {s.label}
          </span>
          <span
            className={`block leading-none mt-1.5 tabular-nums ${s.tone} ${
              s.display ? "font-display text-[30px]" : "font-extrabold text-xl"
            }`}
          >
            {s.value}
          </span>
          <span className="block mt-1.5 text-[11px] text-ink-4 dark:text-ink-dark-4">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
