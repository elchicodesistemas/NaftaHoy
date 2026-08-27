"use client";

import { useState } from "react";
import { Company } from "@/data/mockPrices";
import { ArrowUpDown } from "lucide-react";

interface QuickCompareProps {
  companies?: Company[];
}

export default function QuickCompare({ companies: propCompanies }: QuickCompareProps) {
  const currentCompanies = propCompanies || [];
  const [selectedFuel, setSelectedFuel] = useState<string>("Nafta Súper");

  const fuelOptions = [
    "Nafta Súper",
    "Nafta Premium",
    "Diesel",
    "Diesel Premium",
    "GNC",
  ];

  const sorted = currentCompanies
    .map((c) => {
      const fuelItem = c.fuels.find((f) => f.type.toLowerCase() === selectedFuel.toLowerCase()) ||
        c.fuels.find((f) => f.type.toLowerCase().includes(selectedFuel.toLowerCase().split(" ")[0])) ||
        c.fuels[0];

      return {
        id: c.id,
        name: c.shortName,
        price: fuelItem ? fuelItem.price : 0,
        prev: fuelItem ? fuelItem.prevPrice : 0,
      };
    })
    .filter((item) => item.price > 0)
    .sort((a, b) => a.price - b.price);

  if (sorted.length === 0) return null;

  if (sorted.length === 0) return <div id="comparar" className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4 text-sm text-zinc-500">La comparativa estará disponible cuando finalice la primera sincronización oficial.</div>;
  const cheapest = sorted[0].price;
  const most = sorted[sorted.length - 1].price;
  const range = most - cheapest || 1;

  const brandDots: Record<string, string> = {
    ypf: "bg-accent-blue",
    shell: "bg-accent-amber",
    axion: "bg-accent-purple",
    puma: "bg-accent-green",
    dapsa: "bg-orange-500",
    gulf: "bg-blue-400",
  };

  const barColors: Record<string, string> = {
    ypf: "bg-accent-blue/40",
    shell: "bg-accent-amber/40",
    axion: "bg-accent-purple/40",
    puma: "bg-accent-green/40",
    dapsa: "bg-orange-500/40",
    gulf: "bg-blue-400/40",
  };

  return (
    <div id="comparar" className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Comparativa de Precios
          </h3>
        </div>

        {/* Selector de combustible para comparar */}
        <select
          value={selectedFuel}
          onChange={(e) => setSelectedFuel(e.target.value)}
          className="text-xs font-semibold px-2 py-1 bg-surface-100 dark:bg-dark-surface border border-surface-200 dark:border-dark-border rounded-lg text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
        >
          {fuelOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2.5">
        {sorted.map((item, i) => {
          const width = 25 + ((item.price - cheapest) / range) * 75;
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${brandDots[item.id] || "bg-zinc-400"}`} />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {item.name}
                  </span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold text-accent-green bg-accent-green/10 px-1.5 py-0.5 rounded">
                      MÁS ECONÓMICA
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
                    i === 0 ? "bg-accent-green/60" : (barColors[item.id] || "bg-zinc-400/40")
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-surface-100 dark:border-dark-border flex justify-between items-center text-xs">
        <span className="text-[11px] text-zinc-400">Diferencia máxima:</span>
        <span className="font-bold text-brand-primary tabular-nums text-sm">
          ${(most - cheapest).toLocaleString("es-AR")}/litro
        </span>
      </div>
    </div>
  );
}
