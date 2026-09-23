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

  if (sorted.length === 0) return <div id="comparar" className="bg-panel dark:bg-panel-dark rounded-2xl border border-line dark:border-line-dark p-4 text-sm text-ink-3">La comparativa estará disponible cuando finalice la primera sincronización oficial.</div>;
  const cheapest = sorted[0].price;
  const most = sorted[sorted.length - 1].price;
  const range = most - cheapest || 1;

  const brandDots: Record<string, string> = {
    ypf: "bg-brand-ypf",
    shell: "bg-brand-shell",
    axion: "bg-brand-axion",
    puma: "bg-down dark:bg-down-dark",
    dapsa: "bg-brand-dapsa",
    gulf: "bg-brand-gulf",
  };

  const barColors: Record<string, string> = {
    ypf: "bg-brand-ypf/40",
    shell: "bg-brand-shell/40",
    axion: "bg-brand-axion/40",
    puma: "bg-down dark:bg-down-dark/40",
    dapsa: "bg-brand-dapsa/40",
    gulf: "bg-brand-gulf/40",
  };

  return (
    <div id="comparar" className="bg-panel dark:bg-panel-dark rounded-2xl border border-line dark:border-line-dark p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-4 h-4 text-accent-ink dark:text-accent" />
          <h3 className="text-sm font-semibold text-ink-1 dark:text-ink-dark-1">
            Comparativa de Precios
          </h3>
        </div>

        {/* Selector de combustible para comparar */}
        <select
          value={selectedFuel}
          onChange={(e) => setSelectedFuel(e.target.value)}
          className="text-xs font-semibold px-2 py-1 bg-panel2 dark:bg-panel2-dark border border-line dark:border-line-dark rounded-lg text-ink-1 dark:text-ink-dark-2 outline-none cursor-pointer"
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
                  <span className={`w-2 h-2 rounded-full ${brandDots[item.id] || "bg-brand-blanca"}`} />
                  <span className="text-xs font-medium text-ink-2 dark:text-ink-dark-3">
                    {item.name}
                  </span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold text-down dark:text-down-dark bg-down-bg dark:bg-down-bg-dark px-1.5 py-0.5 rounded">
                      MÁS ECONÓMICA
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-ink-1 dark:text-ink-dark-1 tabular-nums">
                  ${item.price.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="h-1.5 bg-panel2 dark:bg-base-dark rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    i === 0 ? "bg-down/60 dark:bg-down-dark/60" : (barColors[item.id] || "bg-brand-blanca/40")
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-line2 dark:border-line-dark flex justify-between items-center text-xs">
        <span className="text-[11px] text-ink-4">Diferencia máxima:</span>
        <span className="font-bold text-accent-ink dark:text-accent tabular-nums text-sm">
          ${(most - cheapest).toLocaleString("es-AR")}/litro
        </span>
      </div>
    </div>
  );
}
