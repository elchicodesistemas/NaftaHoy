"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg border border-surface-200 dark:border-dark-border hover:bg-surface-100 dark:hover:bg-dark-card transition-colors"
      aria-label="Cambiar tema"
    >
      {dark ? (
        <Sun className="w-4 h-4 text-accent-amber-soft" />
      ) : (
        <Moon className="w-4 h-4 text-zinc-500" />
      )}
    </button>
  );
}
