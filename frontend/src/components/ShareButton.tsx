"use client";

import { useState } from "react";
import { Share2, Check, MessageCircle, Twitter, Link2 } from "lucide-react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://naftahoy.com";
  const shareText = "⛽ Consultá y compará precios de combustibles en NaftaHoy.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("No se pudo copiar", err);
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors shadow-sm"
        aria-label="Compartir precios"
      >
        <Share2 className="w-3.5 h-3.5 text-brand-primary" />
        <span>Compartir</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border shadow-xl z-[100] py-1 text-xs divide-y divide-surface-100 dark:divide-dark-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1">
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors text-left"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleTwitter}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors text-left"
            >
              <Twitter className="w-4 h-4 text-sky-500" />
              <span>X (Twitter)</span>
            </button>
          </div>
          <div className="p-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-400" />
                <span>{copied ? "¡Enlace copiado!" : "Copiar enlace"}</span>
              </div>
              {copied && <Check className="w-3.5 h-3.5 text-accent-green" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
