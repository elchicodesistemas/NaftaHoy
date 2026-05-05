"use client";

import { companies } from "@/data/mockPrices";

export default function QuickCompare() {
  const sorted = companies
    .map((c) => ({
      id: c.id,
      name: c.shortName,
      price: c.fuels[0].price,
      prev: c.fuels[0].prevPrice,
    }))
    .sort((a, b) => a.price - b.price);

  const cheapest = sorted[0].price;
  const most = sorted[sorted.length - 1].price;
  const range = most - cheapest || 1;

  const brandDots: Record<string, string> = {
    ypf: "bg-accent-blue",
    shell: "bg-accent-amber",
    axion: "bg-accent-purple",
    puma: "bg-accent-green",
  };

  const barColors: Record<string, string> = {
    ypf: "bg-accent-blue/40",
    shell: "bg-accent-amber/40",
    axion: "bg-accent-purple/40",
    puma: "bg-accent-green/40",
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Nafta Súper — Comparativa
        </h3>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">CABA</span>
      </div>

      <div className="space-y-2.5">
        {sorted.map((item, i) => {
          const width = 25 + ((item.price - cheapest) / range) * 75;
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${brandDots[item.id]}`} />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {item.name}
                  </span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded">
                      MEJOR PRECIO
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                  ${item.price.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="h-1.5 bg-surface-100 dark:bg-dark-bg rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i === 0 ? "bg-accent-green/50" : barColors[item.id]
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-surface-100 dark:border-dark-border flex justify-between items-center">
        <span className="text-[11px] text-zinc-400">Diferencia máx.</span>
        <span className="text-sm font-bold text-brand-primary tabular-nums">
          ${(most - cheapest).toLocaleString("es-AR")}/litro
        </span>
      </div>
    </div>
  );
}
