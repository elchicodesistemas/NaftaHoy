"use client";

import { useState } from "react";
import { Fuel, Menu, X, MapPin } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import ShareButton from "./ShareButton";

const navLinks = [
  { label: "Precios", href: "#precios" },
  { label: "Comparador", href: "#comparar" },
  { label: "Mapa", href: "#mapa" },
  { label: "Calculadora", href: "#calculadora" },
  { label: "Noticias", href: "#noticias" },
];

export default function Navbar({
  selectedProvince,
  onSelectProvince,
}: {
  selectedProvince?: string;
  onSelectProvince?: (p: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const provinces = [
    { id: "", label: "Argentina (Todo el país)" },
    { id: "CABA", label: "CABA" },
    { id: "BUENOS AIRES", label: "Buenos Aires" },
    { id: "CORDOBA", label: "Córdoba" },
    { id: "SANTA FE", label: "Santa Fe" },
    { id: "MENDOZA", label: "Mendoza" },
    { id: "TUCUMAN", label: "Tucumán" },
    { id: "ENTRE RIOS", label: "Entre Ríos" },
    { id: "NEUQUEN", label: "Neuquén" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-lg border-b border-surface-200 dark:border-dark-border transition-colors">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
              Nafta<span className="text-brand-primary">Hoy</span>
            </span>
          </a>

          {/* Selector de provincia */}
          {onSelectProvince && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-surface-100 dark:bg-dark-card border border-surface-200 dark:border-dark-border rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-brand-primary" />
              <select
                value={selectedProvince || ""}
                onChange={(e) => onSelectProvince(e.target.value)}
                className="bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none cursor-pointer"
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-dark-bg text-zinc-800 dark:text-zinc-200">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-surface-100 dark:hover:bg-dark-card transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side: Share, Live Badge, ThemeToggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">En vivo</span>
            </div>

            <ShareButton />
            <ThemeToggle />

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-surface-100 dark:hover:bg-dark-card"
              aria-label="Menú móvil"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-3 border-t border-surface-200 dark:border-dark-border pt-2 space-y-2">
            {onSelectProvince && (
              <div className="px-2 py-1.5 bg-surface-100 dark:bg-dark-card rounded-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-primary" />
                <select
                  value={selectedProvince || ""}
                  onChange={(e) => {
                    onSelectProvince(e.target.value);
                    setIsOpen(false);
                  }}
                  className="w-full bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-200 outline-none"
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id} className="dark:bg-dark-bg text-zinc-800 dark:text-zinc-200">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-1 pt-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-surface-100 dark:hover:bg-dark-card"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
