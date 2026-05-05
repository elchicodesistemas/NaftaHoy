"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Company } from "@/data/mockPrices";

const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  "pastel-blue":   { bg: "bg-pastel-blue/10",   text: "text-pastel-blue",   border: "border-pastel-blue/20",   glow: "hover:border-pastel-blue/40" },
  "pastel-amber":  { bg: "bg-pastel-amber/10",  text: "text-pastel-amber",  border: "border-pastel-amber/20",  glow: "hover:border-pastel-amber/40" },
  "pastel-purple": { bg: "bg-pastel-purple/10", text: "text-pastel-purple", border: "border-pastel-purple/20", glow: "hover:border-pastel-purple/40" },
  "pastel-green":  { bg: "bg-pastel-green/10",  text: "text-pastel-green",  border: "border-pastel-green/20",  glow: "hover:border-pastel-green/40" },
};

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-pastel-red">
        <TrendingUp className="w-3 h-3" />
        +{change.toFixed(1)}%
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-pastel-green">
        <TrendingDown className="w-3 h-3" />
        {change.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-text-muted">
      <Minus className="w-3 h-3" />
      0.0%
    </span>
  );
}

export default function PriceCard({ company }: { company: Company }) {
  const colors = colorMap[company.color] || colorMap["pastel-amber"];
  const mainFuel = company.fuels[0]; // Nafta Súper como precio principal

  const updateTime = new Date(company.lastUpdate);
  const timeAgo = `${updateTime.getHours()}:${updateTime.getMinutes().toString().padStart(2, "0")}hs`;

  return (
    <div
      className={`group rounded-2xl border ${colors.border} ${colors.glow} bg-nafta-card p-5 transition-all duration-300 glow-hover`}
    >
      {/* Header: Logo + Nombre + Hora */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-lg`}>
            {company.logo}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">{company.name}</h3>
            <span className="text-xs text-text-muted">{timeAgo}</span>
          </div>
        </div>
        <ChangeIndicator change={mainFuel.change} />
      </div>

      {/* Precio principal grande */}
      <div className="mb-4">
        <span className="text-xs text-text-muted uppercase tracking-wider">{mainFuel.type}</span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-3xl font-bold text-text-primary tracking-tight">
            ${mainFuel.price.toLocaleString("es-AR")}
          </span>
          <span className="text-sm text-text-muted">/litro</span>
        </div>
      </div>

      {/* Separador */}
      <div className="h-px bg-nafta-border mb-3" />

      {/* Otros combustibles */}
      <div className="space-y-2">
        {company.fuels.slice(1).map((fuel) => (
          <div key={fuel.type} className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">{fuel.type}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">
                ${fuel.price.toLocaleString("es-AR")}
              </span>
              <ChangeIndicator change={fuel.change} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
