"use client";

import { useState } from "react";
import { Fuel, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { label: "Nafta", href: "#nafta" },
  { label: "Diesel", href: "#diesel" },
  { label: "GNC", href: "#gnc" },
  { label: "Histórico", href: "#historico" },
  { label: "Comparador", href: "#comparar" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-dark-bg/90 backdrop-blur-lg border-b border-surface-200 dark:border-dark-border">
      <div className="max-w-content mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Fuel className="w-4 h-4 text-brand-primary" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100">
              Nafta<span className="text-brand-primary">Hoy</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-surface-100 dark:hover:bg-dark-card transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              En vivo
            </div>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-500 hover:bg-surface-100 dark:hover:bg-dark-card"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-3 border-t border-surface-200 dark:border-dark-border pt-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:bg-surface-100 dark:hover:bg-dark-card"
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
