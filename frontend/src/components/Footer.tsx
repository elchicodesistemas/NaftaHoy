import { Fuel, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white dark:bg-dark-surface border-t border-surface-200 dark:border-dark-border mt-10 transition-colors">
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
              Portal de precios de combustibles en Argentina. Información pública oficial provista por la Secretaría de Energía bajo la Resolución 314/2016.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Combustibles
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "Nafta Súper", href: "#precios" },
                { label: "Nafta Premium", href: "#precios" },
                { label: "Diesel Común", href: "#precios" },
                { label: "Diesel Premium", href: "#precios" },
                { label: "GNC", href: "#precios" },
              ].map((f) => (
                <a
                  key={f.label}
                  href={f.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {f.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Petroleras
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "YPF", href: "#precios" },
                { label: "Shell", href: "#precios" },
                { label: "Axion Energy", href: "#precios" },
                { label: "Puma Energy", href: "#precios" },
                { label: "DAPSA / Gulf", href: "#mapa" },
              ].map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {c.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Herramientas y Secciones
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "Comparador de precios", href: "#comparar" },
                { label: "Mapa interactivo de estaciones", href: "#mapa" },
                { label: "Calculadora de tanque", href: "#calculadora" },
                { label: "Últimas noticias y avisos", href: "#noticias" },
                { label: "Reportes comunitarios", href: "#precios" },
              ].map((t) => (
                <a
                  key={t.label}
                  href={t.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            © 2026 NaftaHoy.com — Todos los derechos reservados.
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Los precios son informativos y corresponden a declaraciones oficiales en surtidor.
          </span>
        </div>
      </div>
    </footer>
  );
}
