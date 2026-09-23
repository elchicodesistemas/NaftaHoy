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
    <footer className="bg-panel dark:bg-panel-dark border-t border-line dark:border-line-dark mt-10 transition-colors">
      <div className="max-w-content mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Fuel className="w-4 h-4 text-accent-ink dark:text-accent" />
              <span className="text-sm font-extrabold text-ink-1 dark:text-ink-dark-1">
                Nafta<span className="text-accent-ink dark:text-accent">Hoy</span>
              </span>
            </div>
            <p className="text-xs text-ink-4 dark:text-ink-dark-4 leading-relaxed">
              Portal de precios de combustibles en Argentina. Información pública oficial provista por la Secretaría de Energía bajo la Resolución 1104/2004.
            </p>
          </div>

          <div>
            <Link href="/combustibles" className="block text-[11px] font-semibold text-ink-3 dark:text-ink-dark-3 uppercase tracking-wider mb-2 hover:text-accent-ink dark:hover:text-accent">Combustibles</Link>
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
                  className="block text-xs text-ink-4 hover:text-ink-1 dark:hover:text-ink-dark-1 transition-colors"
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <Link href="/petroleras" className="block text-[11px] font-semibold text-ink-3 dark:text-ink-dark-3 uppercase tracking-wider mb-2 hover:text-accent-ink dark:hover:text-accent">Petroleras</Link>
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
                  className="block text-xs text-ink-4 hover:text-ink-1 dark:hover:text-ink-dark-1 transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <Link href="/provincias" className="block text-[11px] font-semibold text-ink-3 dark:text-ink-dark-3 uppercase tracking-wider mb-2 hover:text-accent-ink dark:hover:text-accent">Provincias</Link>
            <div className="space-y-1.5">
              {[
                { label: "Buenos Aires", href: "/buenos-aires" },
                { label: "Capital Federal", href: "/capital-federal" },
                { label: "Córdoba", href: "/cordoba" },
                { label: "Mendoza", href: "/mendoza" },
                { label: "Santa Fe", href: "/santa-fe" },
                { label: "Tucumán", href: "/tucuman" },
                { label: "Entre Ríos", href: "/entre-rios" },
                { label: "Neuquén", href: "/neuquen" },
              ].map((province) => (
                <Link
                  key={province.label}
                  href={province.href}
                  className="block text-xs text-ink-4 hover:text-ink-1 dark:hover:text-ink-dark-1 transition-colors"
                >
                  {province.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold text-ink-3 dark:text-ink-dark-3 uppercase tracking-wider mb-2">
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
                  className="block text-xs text-ink-4 hover:text-ink-1 dark:hover:text-ink-dark-1 transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-line2 dark:border-line-dark flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[11px] text-ink-4 dark:text-ink-dark-4">
            © 2026 NaftaHoy.com — Todos los derechos reservados.
          </span>
          <span className="text-[11px] text-ink-4 dark:text-ink-dark-4">
            Los precios son informativos y corresponden a declaraciones oficiales en surtidor.
          </span>
          <Link href="/privacidad" className="text-[11px] text-ink-4 hover:text-ink-1 dark:hover:text-ink-dark-1">Privacidad</Link>
        </div>

        <a
          href="https://elchicodesistemas.com.ar/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-fit mx-auto items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-panel2 hover:text-ink-1 dark:text-ink-dark-3 dark:hover:bg-panel2-dark dark:hover:text-ink-dark-1"
          aria-label="Desarrollado por El Chico de Sistemas — abrir sitio web"
        >
          <span>Desarrollado por</span>
          <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-panel ring-1 ring-line dark:ring-line-dark">
            <Image src={`${basePath}/el-chico-de-sistemas.png`} alt="Logo de El Chico de Sistemas" width={28} height={28} unoptimized className="h-full w-full object-cover" />
          </span>
          <span className="font-semibold text-ink-1 dark:text-ink-dark-1">El Chico de Sistemas</span>
        </a>
      </div>
    </footer>
  );
}
