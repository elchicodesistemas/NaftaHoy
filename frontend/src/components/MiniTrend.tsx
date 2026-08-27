"use client";

import { weeklyTrend } from "@/data/mockPrices";

export default function MiniTrend() {
  const prices = weeklyTrend.map((d) => d.ypf);
  const min = Math.min(...prices) - 10;
  const max = Math.max(...prices) + 10;
  const range = max - min;

  const w = 280;
  const h = 55;
  const pad = 6;

  const pts = prices.map((p, i) => ({
    x: pad + (i / (prices.length - 1)) * (w - pad * 2),
    y: h - pad - ((p - min) / range) * (h - pad * 2),
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;

  const first = prices[0];
  const last = prices[prices.length - 1];
  const change = ((last - first) / first) * 100;

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border p-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Tendencia semanal
          </h3>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Nafta Súper YPF
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${change >= 0 ? "text-accent-red" : "text-accent-green"}`}>
            {change >= 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
          <span className="block text-[10px] text-zinc-400 dark:text-zinc-500">esta semana</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14 mt-1">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8a849" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e8a849" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#tg)" />
        <path d={line} fill="none" stroke="#e8a849" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill="#e8a849" />
      </svg>

      <div className="flex justify-between mt-1">
        {weeklyTrend.map((d) => (
          <span key={d.day} className="text-[10px] text-zinc-400 dark:text-zinc-500">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
