"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { Company } from "@/data/mockPrices";
import BrandLogo from "./BrandLogo";

function Change({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  const pct = ((diff / prev) * 100).toFixed(1);

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-accent-red font-medium">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs">+{pct}%</span>
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-accent-green font-medium">
        <TrendingDown className="w-3 h-3" />
        <span className="text-xs">{pct}%</span>
      </span>
    );
  }
  return <span className="text-xs text-zinc-400">-</span>;
}

export default function PriceTable({ company }: { company: Company }) {
  const time = new Date(company.lastUpdate);
  const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")}`;

  // Color por marca
  const brandColors: Record<string, string> = {
    ypf: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
    shell: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
    axion: "bg-accent-purple/15 text-accent-purple border-accent-purple/30",
    puma: "bg-accent-green/15 text-accent-green border-accent-green/30",
  };

  const brandAccent = brandColors[company.id] || brandColors.ypf;
  const mainFuel = company.fuels[0];

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border overflow-hidden hover:border-surface-300 dark:hover:border-dark-border transition-colors">
      {/* Header con marca */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-surface-100 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <BrandLogo brand={company.id} size={28} />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            {company.name}
          </span>
        </div>
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          {timeStr}hs
        </span>
      </div>

      {/* Precio destacado */}
      <div className="px-4 py-3 bg-surface-50 dark:bg-dark-surface border-b border-surface-100 dark:border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide font-medium">
              {mainFuel.type}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tabular-nums">
                ${mainFuel.price.toLocaleString("es-AR")}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">/litro</span>
            </div>
          </div>
          <Change current={mainFuel.price} prev={mainFuel.prevPrice} />
        </div>
      </div>

      {/* Tabla de precios */}
      <div className="divide-y divide-surface-100 dark:divide-dark-border">
        {company.fuels.slice(1).map((fuel) => (
          <div key={fuel.type} className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{fuel.type}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                ${fuel.price.toLocaleString("es-AR")}
              </span>
              <Change current={fuel.price} prev={fuel.prevPrice} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
