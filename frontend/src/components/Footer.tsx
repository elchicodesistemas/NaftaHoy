import { Fuel } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-surface-200 dark:border-dark-border mt-10">
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-extrabold text-zinc-700 dark:text-zinc-200">
                Nafta<span className="text-brand-primary">Hoy</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Precios de combustibles actualizados en tiempo real. Datos de fuentes oficiales.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Combustibles
            </h4>
            <div className="space-y-1.5">
              {["Nafta Súper", "Nafta Premium", "Diesel", "Diesel Premium", "GNC"].map((f) => (
                <a key={f} href="#" className="block text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{f}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Petroleras
            </h4>
            <div className="space-y-1.5">
              {["YPF", "Shell", "Axion Energy", "Puma Energy", "PAE"].map((c) => (
                <a key={c} href="#" className="block text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{c}</a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Herramientas
            </h4>
            <div className="space-y-1.5">
              {["Comparador", "Histórico", "Por zona", "API", "Alertas"].map((t) => (
                <a key={t} href="#" className="block text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            © 2026 NaftaHoy.com — Todos los derechos reservados
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Los precios son informativos y pueden variar según la estación.
          </span>
        </div>
      </div>
    </footer>
  );
}
