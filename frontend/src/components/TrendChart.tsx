import { weeklyTrend } from "@/data/mockPrices";

export default function TrendChart() {
  const prices = weeklyTrend.map((d) => d.ypf);
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

  const gridLines = [1, 2, 3, 4].map((n) => pad + (n * (h - pad * 2)) / 5);

  return (
    <div className="bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl px-6 py-5 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between mb-2.5">
        <div>
          <h2 className="font-display text-[22px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
            Tendencia semanal
          </h2>
          <span className="text-xs text-ink-4 dark:text-ink-dark-4">Nafta Súper · YPF · últimos 7 días</span>
        </div>
        <div className="text-right">
          <span
            className={`font-display text-[26px] ${
              up ? "text-up dark:text-up-dark" : "text-down dark:text-down-dark"
            }`}
          >
            {up ? "+" : ""}
            {change.toFixed(1).replace(".", ",")}%
          </span>
          <span className="block text-[11px] text-ink-4 dark:text-ink-dark-4">esta semana</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[170px]">
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffc400" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffc400" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((y, i) => (
          <line
            key={i}
            x1={pad}
            y1={y}
            x2={w - pad}
            y2={y}
            className="stroke-line2 dark:stroke-line2-dark"
            strokeWidth="1"
          />
        ))}
        <path d={area} fill="url(#tg)" />
        <path d={line} fill="none" stroke="#ffc400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="5" fill="#ffc400" />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="11" fill="#ffc400" opacity="0.22" />
        <text
          x={pts[pts.length - 1].x - 10}
          y={pts[pts.length - 1].y - 17 < 15 ? 20 : pts[pts.length - 1].y - 17}
          textAnchor="end"
          className="fill-ink-1 dark:fill-ink-dark-1"
          fontSize="15"
          fontWeight="700"
          fontFamily="Archivo, sans-serif"
        >
          ${last.toLocaleString("es-AR")}
        </text>
      </svg>

      <div className="flex justify-between mt-1.5 px-1.5">
        {weeklyTrend.map((d) => (
          <span key={d.day} className="text-[11px] text-ink-4 dark:text-ink-dark-4">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
