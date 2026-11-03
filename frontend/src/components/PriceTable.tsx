"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { Company } from "@/data/mockPrices";
import BrandLogo from "./BrandLogo";

function Change({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  const pct = ((diff / prev) * 100).toFixed(1);

  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-up font-medium">
        <TrendingUp className="w-3 h-3" />
        <span className="text-xs">+{pct}%</span>
      </span>
    );
  }
  if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-down font-medium">
        <TrendingDown className="w-3 h-3" />
        <span className="text-xs">{pct}%</span>
      </span>
    );
  }
  return <span className="text-xs text-ink-4">-</span>;
}

export default function PriceTable({ company }: { company: Company }) {
  const time = new Date(company.lastUpdate);
  const timeStr = new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(time);

  // Color por marca. Los tokens brand-* salen de src/lib/brands.ts, que es la
  // unica fuente de verdad de los colores de petrolera.
  const brandColors: Record<string, string> = {
    ypf: "bg-brand-ypf/15 text-brand-ypf border-brand-ypf/30",
    shell: "bg-brand-shell/15 text-brand-shell border-brand-shell/30",
    axion: "bg-brand-axion/15 text-brand-axion border-brand-axion/30",
    puma: "bg-brand-puma/15 text-brand-puma border-brand-puma/30",
    dapsa: "bg-brand-dapsa/15 text-brand-dapsa border-brand-dapsa/30",
    gulf: "bg-brand-gulf/15 text-brand-gulf border-brand-gulf/30",
    blanca: "bg-brand-blanca/15 text-brand-blanca border-brand-blanca/30",
  };

  const brandAccent = brandColors[company.id] || brandColors.ypf;
  const mainFuel = company.fuels[0];

  return (
    <div className="bg-panel dark:bg-panel2-dark rounded-xl border border-line dark:border-line-dark overflow-hidden hover:border-line dark:hover:border-line-dark transition-colors">
      {/* Header con marca */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-line2 dark:border-line-dark">
        <div className="flex items-center gap-2.5">
          <BrandLogo brand={company.id} size={28} />
          <span className="text-sm font-semibold text-ink-1 dark:text-ink-dark-1">
            {company.name}
          </span>
        </div>
        <span className="text-[11px] text-ink-4 dark:text-ink-dark-4">
          {timeStr}hs
        </span>
      </div>

      {/* Precio destacado */}
      <div className="px-4 py-3 bg-base dark:bg-panel-dark border-b border-line2 dark:border-line-dark">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-ink-4 dark:text-ink-dark-4 uppercase tracking-wide font-medium">
              {mainFuel.type}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-extrabold text-ink-1 dark:text-ink-dark-1 tabular-nums">
                ${mainFuel.price.toLocaleString("es-AR")}
              </span>
              <span className="text-xs text-ink-4 dark:text-ink-dark-4">/litro</span>
            </div>
          </div>
          <Change current={mainFuel.price} prev={mainFuel.prevPrice} />
        </div>
      </div>

      {/* Tabla de precios */}
      <div className="divide-y divide-line2 dark:divide-line-dark">
        {company.fuels.slice(1).map((fuel) => (
          <div key={fuel.type} className="px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-ink-2 dark:text-ink-dark-3">{fuel.type}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-ink-1 dark:text-ink-dark-1 tabular-nums">
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
