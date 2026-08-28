"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function MiniTrend() {
  const [trend, setTrend] = useState<Array<{ day: string; ypf?: number }>>([]);
  useEffect(() => { api.getTrends().then(setTrend); }, []);
  const values = trend.map((point) => point.ypf).filter((value): value is number => typeof value === "number");
  if (values.length < 2) return <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4 text-sm text-zinc-500">La tendencia mensual estará disponible al acumular historial oficial suficiente.</div>;
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 280},${55 - ((value - min) / range) * 45}`).join(" ");
  const change = ((values.at(-1)! - values[0]) / values[0]) * 100;
  return <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4"><div className="flex justify-between"><div><h3 className="text-sm font-semibold">Tendencia mensual</h3><span className="text-[11px] text-zinc-400">Nafta Súper YPF</span></div><b className={change > 0 ? "text-accent-red" : "text-accent-green"}>{change > 0 ? "+" : ""}{change.toFixed(1)}%</b></div><svg viewBox="0 0 280 60" className="w-full h-14 mt-2"><polyline points={points} fill="none" stroke="#e8a849" strokeWidth="2" /></svg></div>;
}
