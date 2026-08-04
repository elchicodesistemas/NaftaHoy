"use client";

import { Fuel, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Pizarra", href: "#pizarra" },
  { label: "Tendencia", href: "#tendencia" },
  { label: "Mapa", href: "#mapa" },
  { label: "Noticias", href: "#noticias" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[1000] bg-panel/90 dark:bg-base-dark/90 backdrop-blur-lg border-b border-line dark:border-line-dark">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-[62px]">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <Fuel
                className="w-[19px] h-[19px]"
                strokeWidth={2.2}
                color="#141414"
              />
            </div>
            <span className="font-display text-xl tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
              Nafta<span className="text-accent-ink dark:text-accent">Hoy</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-2 rounded-md text-[13px] font-semibold uppercase tracking-wide text-ink-3 dark:text-ink-dark-3 hover:text-accent-ink dark:hover:text-accent transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-wider text-down dark:text-down-dark">
              <span className="w-2 h-2 rounded-full bg-down dark:bg-down-dark animate-live-blink" />
              EN VIVO
            </div>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-ink-3 dark:text-ink-dark-3 hover:bg-panel2 dark:hover:bg-panel2-dark"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-3 border-t border-line dark:border-line-dark pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-wide text-ink-3 dark:text-ink-dark-3 hover:bg-panel2 dark:hover:bg-panel2-dark"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
