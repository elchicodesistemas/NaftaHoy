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
  const superAvg = hasData ? `$${stats!.superAvg.toLocaleString("es-AR")}` : "—";
  const variation = hasData ? `${stats!.variationPct > 0 ? "+" : ""}${stats!.variationPct}%` : "—";
  const cheapestBrand = hasData ? stats!.cheapestBrand : "—";
  const cheapestSub = hasData ? `$${stats!.cheapestPrice.toLocaleString("es-AR")}/lt` : "sin datos";
  const mostExpensiveBrand = hasData ? stats!.mostExpensiveBrand : "—";
  const mostExpensiveSub = hasData ? `$${stats!.mostExpensivePrice.toLocaleString("es-AR")}/lt` : "sin datos";

  const statItems = [
    { label: "Nafta Súper", value: superAvg, sub: "promedio", color: "text-brand-primary" },
    { label: "Variación", value: variation, sub: "semanal", color: "text-accent-red" },
    { label: "Más barata", value: cheapestBrand, sub: cheapestSub, color: "text-accent-green" },
    { label: "Más cara", value: mostExpensiveBrand, sub: mostExpensiveSub, color: "text-accent-red-soft" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-dark-card rounded-lg border border-surface-200 dark:border-dark-border px-3 py-2.5 shadow-sm"
        >
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">{s.label}</span>
          <span className={`text-lg font-bold ${s.color} block leading-tight`}>{s.value}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
