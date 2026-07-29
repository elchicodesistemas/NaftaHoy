import { Fuel } from "lucide-react";

const links = ["Comparador", "Histórico", "Por zona", "API"];

export default function Footer() {
  return (
    <footer className="border-t border-line dark:border-line-dark bg-panel2 dark:bg-panel2-dark">
      <div className="max-w-content mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <Fuel className="w-[15px] h-[15px]" strokeWidth={2.2} color="#141414" />
          </div>
          <span className="font-display text-base tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
            Nafta<span className="text-accent-ink dark:text-accent">Hoy</span>
          </span>
        </div>

        <div className="flex gap-5">
          {links.map((label) => (
            <a
              key={label}
              href="#"
              className="text-xs text-ink-3 dark:text-ink-dark-3 hover:text-accent-ink dark:hover:text-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        <span className="text-[11px] text-ink-4 dark:text-ink-dark-4">
          © 2026 NaftaHoy.com · Los precios son informativos y pueden variar según la estación.
        </span>
      </div>
    </footer>
  );
}
