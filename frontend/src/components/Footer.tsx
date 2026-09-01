import { Fuel, ArrowUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
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
              Portal de precios de combustibles en Argentina. Información pública oficial provista por la Secretaría de Energía bajo la Resolución 1104/2004.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Combustibles
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "Nafta Súper", href: "/precio-nafta-super" },
                { label: "Nafta Premium", href: "/precio-nafta-premium" },
                { label: "Gasoil", href: "/precio-gasoil" },
                { label: "GNC", href: "/precio-gnc" },
              ].map((f) => (
                <Link
                  key={f.label}
                  href={f.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Petroleras
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "YPF", href: "/ypf" },
                { label: "Shell", href: "/shell" },
                { label: "Axion Energy", href: "/axion" },
                { label: "Puma Energy", href: "/puma" },
                { label: "DAPSA / Gulf", href: "/#mapa" },
              ].map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
              Herramientas y Secciones
            </h4>
            <div className="space-y-1.5">
              {[
                { label: "Comparador de precios", href: "/#comparar" },
                { label: "Mapa interactivo de estaciones", href: "/#mapa" },
                { label: "Calculadora de tanque", href: "/#calculadora" },
                { label: "Últimas noticias y avisos", href: "/#noticias" },
                { label: "Reportes comunitarios", href: "/#precios" },
                { label: "Anunciá en NaftaHoy", href: "/publicidad" },
              ].map((t) => (
                <Link
                  key={t.label}
                  href={t.href}
                  className="block text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {t.label}
                </Link>
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
          <Link href="/privacidad" className="text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">Privacidad</Link>
        </div>

        <a
          href="https://elchicodesistemas.com.ar/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-fit mx-auto items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-surface-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-dark-card dark:hover:text-zinc-100"
          aria-label="Desarrollado por El Chico de Sistemas — abrir sitio web"
        >
          <span>Desarrollado por</span>
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-surface-200 dark:ring-dark-border">
            <Image src={`${basePath}/el-chico-de-sistemas.png`} alt="Logo de El Chico de Sistemas" width={28} height={28} unoptimized className="h-full w-full object-cover" />
          </span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-200">El Chico de Sistemas</span>
        </a>
      </div>
    </footer>
  );
}
