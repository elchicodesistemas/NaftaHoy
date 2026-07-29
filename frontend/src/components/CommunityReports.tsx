"use client";

import { useState } from "react";
import { MessageSquare, X, MapPin, Clock, ThumbsUp, Send } from "lucide-react";
import { BRAND_COLORS, type BrandId } from "@/lib/brands";

interface Report {
  id: number;
  user: string;
  region: string;
  brand: BrandId;
  what: string;
  price: number;
  time: string;
  likes: number;
}

// Datos mock — en producción vendrán de la API
const mockReports: Report[] = [
  { id: 1, user: "Carlos M.", region: "CABA - Palermo", brand: "ypf", what: "YPF — Nafta Súper", price: 1999, time: "Hace 15 min", likes: 4 },
  { id: 2, user: "Laura G.", region: "GBA - Quilmes", brand: "shell", what: "Shell — V-Power", price: 2460, time: "Hace 32 min", likes: 2 },
  { id: 3, user: "Martín R.", region: "CABA - Caballito", brand: "axion", what: "Axion — Nafta Súper", price: 2039, time: "Hace 1 hora", likes: 7 },
  { id: 4, user: "Sofía P.", region: "GBA - Morón", brand: "puma", what: "Puma — Diesel", price: 1870, time: "Hace 1 hora", likes: 3 },
  { id: 5, user: "Diego F.", region: "CABA - Belgrano", brand: "ypf", what: "YPF — Infinia", price: 2310, time: "Hace 2 horas", likes: 5 },
  { id: 6, user: "Ana K.", region: "GBA - La Plata", brand: "shell", what: "Shell — Diesel", price: 1985, time: "Hace 2 horas", likes: 1 },
];

export default function CommunityReports() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Abrir reportes"
        className="fixed top-[38%] right-0 z-[2000] flex flex-col items-center gap-2 px-2.5 py-4 rounded-l-[10px] bg-accent text-[#141414] shadow-[-6px_4px_20px_rgba(0,0,0,.25)] dark:shadow-[-6px_4px_20px_rgba(0,0,0,.45)] hover:pr-4 transition-[padding]"
      >
        <MessageSquare className="w-4 h-4" strokeWidth={2.2} />
        <span className="vertical-text text-xs font-bold tracking-[.14em] uppercase">Reportes</span>
        <span className="min-w-[18px] h-[18px] rounded-full bg-black/15 flex items-center justify-center text-[10px] font-extrabold">
          {mockReports.length}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed right-0 top-20 bottom-0 z-[2000] w-[380px] max-w-[90vw] bg-panel dark:bg-panel-dark border border-line dark:border-line-dark border-r-0 rounded-l-2xl shadow-[-16px_0_48px_rgba(0,0,0,.15)] dark:shadow-[-16px_0_48px_rgba(0,0,0,.5)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-[18px] py-3.5 bg-accent">
        <div className="flex items-center gap-2.5 text-[#141414]">
          <MessageSquare className="w-4 h-4" strokeWidth={2.2} />
          <span className="font-display text-[15px] tracking-wide uppercase">Reportes de la comunidad</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar"
          className="p-1.5 rounded-md bg-black/[.14] hover:bg-black/[.28] transition-colors"
        >
          <X className="w-[15px] h-[15px] text-[#141414]" strokeWidth={2.4} />
        </button>
      </div>

      <div className="px-[18px] py-2.5 bg-panel2 dark:bg-panel2-dark border-b border-line2 dark:border-line2-dark">
        <p className="text-[11px] text-ink-3 dark:text-ink-dark-3 leading-relaxed">
          Precios reportados por la comunidad. Compartí el que ves en tu estación y ayudá a otros conductores.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mockReports.map((report) => (
          <div
            key={report.id}
            className="px-[18px] py-3.5 border-b border-line2 dark:border-line2-dark hover:bg-panel2 dark:hover:bg-panel2-dark transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-ink-1 dark:text-ink-dark-1">{report.user}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-ink-4 dark:text-ink-dark-4">
                    <Clock className="w-2.5 h-2.5" />
                    {report.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="w-[9px] h-[9px] rounded-[3px] inline-block"
                    style={{ background: BRAND_COLORS[report.brand] }}
                  />
                  <span className="text-xs text-ink-3 dark:text-ink-dark-3">{report.what}</span>
                  <span className="font-display text-base text-ink-1 dark:text-ink-dark-1 tabular-nums">
                    ${report.price.toLocaleString("es-AR")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-ink-4 dark:text-ink-dark-4" />
                  <span className="text-[11px] text-ink-4 dark:text-ink-dark-4">{report.region}</span>
                </div>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-line2 dark:border-line2-dark text-ink-4 dark:text-ink-dark-4 hover:text-down dark:hover:text-down-dark hover:border-down dark:hover:border-down-dark transition-colors shrink-0">
                <ThumbsUp className="w-3 h-3" />
                <span className="text-[10px] font-bold">{report.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3.5 py-3 bg-panel2 dark:bg-panel2-dark border-t border-line dark:border-line-dark">
        <div className="flex gap-2">
          <select className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-line dark:border-line-dark bg-panel dark:bg-panel-dark text-ink-1 dark:text-ink-dark-1">
            <option>Estación</option>
            <option>YPF</option>
            <option>Shell</option>
            <option>Axion</option>
            <option>Puma</option>
          </select>
          <input
            type="number"
            placeholder="$ Precio"
            className="w-[86px] text-xs px-2.5 py-2 rounded-lg border border-line dark:border-line-dark bg-panel dark:bg-panel-dark text-ink-1 dark:text-ink-dark-1 tabular-nums"
          />
          <button
            aria-label="Enviar reporte"
            className="px-3.5 py-2 rounded-lg bg-accent text-[#141414] hover:brightness-110 transition-[filter]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-ink-4 dark:text-ink-dark-4 mt-1.5 text-center">
          Solo usuarios verificados pueden reportar precios
        </p>
      </div>
    </div>
  );
}
