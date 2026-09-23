"use client";

import { useState } from "react";
import Link from "next/link";
import { Fuel, Menu, X, MapPin } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ShareButton from "./ShareButton";

// Los href arrancan con "/" a proposito: la nav tambien se renderiza en las
// paginas SEO (/combustibles, /buenos-aires/..., etc.), donde un "#precios"
// suelto apuntaria a la pagina actual en vez de a la portada.
// soloXl: en mayusculas y con tracking, "Anunciá en NaftaHoy" no entra en la
// barra junto al selector de provincia y desborda. Se muestra recien en 2xl;
// abajo de eso sigue accesible desde el menu movil y desde el footer.
const navLinks = [
  { label: "Precios", href: "/#precios" },
  { label: "Comparador", href: "/#comparar" },
  { label: "Mapa", href: "/#mapa" },
  { label: "Calculadora", href: "/#calculadora" },
  { label: "Noticias", href: "/#noticias" },
  { label: "Anunciá en NaftaHoy", href: "/publicidad", soloXl: true },
];

const provinces = [
  { id: "", label: "Argentina (Todo el país)" },
  { id: "Capital Federal", label: "Capital Federal" },
  { id: "BUENOS AIRES", label: "Buenos Aires" },
  { id: "CORDOBA", label: "Córdoba" },
  { id: "SANTA FE", label: "Santa Fe" },
  { id: "MENDOZA", label: "Mendoza" },
  { id: "TUCUMAN", label: "Tucumán" },
  { id: "ENTRE RIOS", label: "Entre Ríos" },
  { id: "NEUQUEN", label: "Neuquén" },
];

export default function Navbar({
  selectedProvince,
  onSelectProvince,
}: {
  selectedProvince?: string;
  onSelectProvince?: (p: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[1000] bg-panel/90 dark:bg-base-dark/90 backdrop-blur-lg border-b border-line dark:border-line-dark">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-[62px] gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Fuel className="w-[19px] h-[19px]" strokeWidth={2.2} color="#141414" />
            </div>
            <span className="font-display text-xl tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
              Nafta<span className="text-accent-ink dark:text-accent">Hoy</span>
            </span>
          </Link>

          {/* Selector de provincia */}
          {onSelectProvince && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line dark:border-line-dark bg-panel2 dark:bg-panel2-dark">
              <MapPin className="w-3.5 h-3.5 text-accent-ink dark:text-accent" />
              <select
                value={selectedProvince || ""}
                onChange={(e) => onSelectProvince(e.target.value)}
                aria-label="Elegir provincia"
                className="bg-transparent text-xs font-semibold uppercase tracking-wide text-ink-2 dark:text-ink-dark-2 outline-none cursor-pointer"
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id} className="bg-panel dark:bg-panel-dark">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Links de escritorio */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-2 rounded-md text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap text-ink-3 dark:text-ink-dark-3 hover:text-accent-ink dark:hover:text-accent transition-colors ${
                  link.soloXl ? "hidden 2xl:block" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Derecha */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-wider text-down dark:text-down-dark">
              <span className="w-2 h-2 rounded-full bg-down dark:bg-down-dark animate-live-blink" />
              EN VIVO
            </div>

            <ShareButton />
            <ThemeToggle />

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="xl:hidden p-2 rounded-lg text-ink-3 dark:text-ink-dark-3 hover:bg-panel2 dark:hover:bg-panel2-dark"
              aria-label="Menú móvil"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isOpen && (
          <div className="xl:hidden pb-3 border-t border-line dark:border-line-dark pt-2 space-y-2">
            {onSelectProvince && (
              <div className="px-3 py-2 rounded-lg border border-line dark:border-line-dark bg-panel2 dark:bg-panel2-dark flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-ink dark:text-accent" />
                <select
                  value={selectedProvince || ""}
                  onChange={(e) => {
                    onSelectProvince(e.target.value);
                    setIsOpen(false);
                  }}
                  aria-label="Elegir provincia"
                  className="w-full bg-transparent text-xs font-semibold uppercase tracking-wide text-ink-2 dark:text-ink-dark-2 outline-none"
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id} className="bg-panel dark:bg-panel-dark">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1 pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wide text-ink-3 dark:text-ink-dark-3 hover:bg-panel2 dark:hover:bg-panel2-dark"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
