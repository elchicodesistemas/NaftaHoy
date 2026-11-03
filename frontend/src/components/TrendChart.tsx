"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

/**
 * Gráfico de tendencia del rediseño, alimentado con `/api/prices/trends`
 * (antes lo mostraba MiniTrend en versión chica).
 */
export default function TrendChart() {
  const [trend, setTrend] = useState<Array<{ day: string; ypf?: number }>>([]);
  useEffect(() => {
    api.getTrends().then(setTrend);
  }, []);

  const series = trend.filter((d): d is { day: string; ypf: number } => typeof d.ypf === "number");

  const header = (right?: React.ReactNode) => (
    <div className="flex items-start justify-between mb-2.5">
      <div>
        <h2 className="font-display text-[22px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">Tendencia</h2>
        <span className="text-xs text-ink-4 dark:text-ink-dark-4">Nafta Súper · YPF · historial oficial</span>
      </div>
      {right}
    </div>
  );

  const card = "bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl px-6 py-5 shadow-sm dark:shadow-none";

  if (series.length < 2) {
    return (
      <div className={card}>
        {header()}
        <p className="text-sm text-ink-3 dark:text-ink-dark-3 py-10 text-center text-pretty">
          La tendencia estará disponible al acumular historial oficial suficiente.
        </p>
      </div>
    );
  }

  const prices = series.map((d) => d.ypf);
  const min = Math.min(...prices) - 10;
  const max = Math.max(...prices) + 10;
  const range = max - min || 1;

  const w = 640;
  const h = 180;
  const pad = 14;

  const pts = prices.map((p, i) => ({
    x: pad + (i / (prices.length - 1)) * (w - pad * 2),
    y: h - pad - ((p - min) / range) * (h - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;

  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = ((last - first) / first) * 100;
  const up = change >= 0;
  const lastPt = pts[pts.length - 1];

  const gridLines = [1, 2, 3, 4].map((n) => pad + (n * (h - pad * 2)) / 5);
  // Con series largas las etiquetas se pisan: mostramos como máximo 7.
  const step = Math.ceil(series.length / 7);
  const labels = series.filter((_, i) => i % step === 0 || i === series.length - 1);

  return (
    <div className={card}>
      {header(
        <div className="text-right">
          <span className={`font-display text-[26px] ${up ? "text-up dark:text-up-dark" : "text-down dark:text-down-dark"}`}>
            {up ? "+" : ""}
            {change.toFixed(1).replace(".", ",")}%
          </span>
          <span className="block text-[11px] text-ink-4 dark:text-ink-dark-4">en el período</span>
        </div>,
      )}

      <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} className="w-full h-[170px]">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffc400" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffc400" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((y) => (
          <line key={y} x1={pad} y1={y} x2={w - pad} y2={y} className="stroke-line2 dark:stroke-line2-dark" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#tg)" />
        <path d={line} fill="none" stroke="#ffc400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastPt.x} cy={lastPt.y} r="5" fill="#ffc400" />
        <circle cx={lastPt.x} cy={lastPt.y} r="11" fill="#ffc400" opacity="0.22" />
        <text
          x={lastPt.x - 10}
          y={lastPt.y - 17 < 15 ? 20 : lastPt.y - 17}
          textAnchor="end"
          className="fill-ink-1 dark:fill-ink-dark-1"
          fontSize="15"
          fontWeight="700"
          fontFamily="Archivo, sans-serif"
        >
          ${Math.round(last).toLocaleString("es-AR")}
        </text>
      </svg>

      <div className="flex justify-between mt-1.5 px-1.5">
        {labels.map((d) => (
          <span key={d.day} className="text-[11px] text-ink-4 dark:text-ink-dark-4">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
