"use client";

export default function StatsBar() {
  const stats = [
    { label: "Nafta Súper", value: "$1.999", sub: "promedio", color: "text-brand-primary" },
    { label: "Variación", value: "+2.5%", sub: "semanal", color: "text-accent-red" },
    { label: "Más barata", value: "Puma", sub: "$1.979/lt", color: "text-accent-green" },
    { label: "Más cara", value: "Shell", sub: "$2.099/lt", color: "text-accent-red-soft" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white dark:bg-dark-card rounded-lg border border-surface-200 dark:border-dark-border px-3 py-2.5"
        >
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 block">{s.label}</span>
          <span className={`text-lg font-bold ${s.color} block leading-tight`}>{s.value}</span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{s.sub}</span>
        </div>
      ))}
    </div>
  );
}
