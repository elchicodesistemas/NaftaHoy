"use client";

import { useState } from "react";
import { MessageSquare, X, ChevronUp, MapPin, Clock, ThumbsUp, Send, Fuel } from "lucide-react";

interface Report {
  id: number;
  user: string;
  region: string;
  station: string;
  fuelType: string;
  price: number;
  time: string;
  likes: number;
}

// Datos mock — en producción vendrán de la API
const mockReports: Report[] = [
  { id: 1, user: "Carlos M.", region: "CABA - Palermo", station: "YPF", fuelType: "Nafta Súper", price: 1999, time: "Hace 15 min", likes: 4 },
  { id: 2, user: "Laura G.", region: "GBA - Quilmes", station: "Shell", fuelType: "V-Power", price: 2460, time: "Hace 32 min", likes: 2 },
  { id: 3, user: "Martín R.", region: "CABA - Caballito", station: "Axion", fuelType: "Nafta Súper", price: 2039, time: "Hace 1 hora", likes: 7 },
  { id: 4, user: "Sofía P.", region: "GBA - Morón", station: "Puma", fuelType: "Diesel", price: 1870, time: "Hace 1 hora", likes: 3 },
  { id: 5, user: "Diego F.", region: "CABA - Belgrano", station: "YPF", fuelType: "Infinia", price: 2310, time: "Hace 2 horas", likes: 5 },
  { id: 6, user: "Ana K.", region: "GBA - La Plata", station: "Shell", fuelType: "Diesel", price: 1985, time: "Hace 2 horas", likes: 1 },
];

const brandColors: Record<string, string> = {
  YPF: "bg-blue-600",
  Shell: "bg-yellow-500",
  Axion: "bg-purple-600",
  Puma: "bg-green-600",
};

export default function CommunityReports() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-dark transition-all group"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-semibold">Reportes</span>
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {mockReports.length}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-[9999] w-[360px] bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden transition-all ${
        isMinimized ? "h-[52px]" : "h-[520px]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-dark-surface border-b border-surface-200 dark:border-dark-border cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <Fuel className="w-4 h-4 text-brand-primary" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Reportes de la comunidad
          </span>
          <span className="text-[10px] font-bold text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
            {mockReports.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-border transition-colors"
          >
            <ChevronUp className={`w-4 h-4 text-zinc-400 transition-transform ${isMinimized ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1 rounded hover:bg-surface-200 dark:hover:bg-dark-border transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Info */}
          <div className="px-4 py-2 bg-brand-primary/5 border-b border-surface-100 dark:border-dark-border">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Precios reportados por usuarios verificados. Ayudá a la comunidad compartiendo el precio que ves en tu estación.
            </p>
          </div>

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto" style={{ height: "340px" }}>
            {mockReports.map((report) => (
              <div
                key={report.id}
                className="px-4 py-3 border-b border-surface-100 dark:border-dark-border last:border-0 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* User + time */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {report.user}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                        <Clock className="w-2.5 h-2.5" />
                        {report.time}
                      </span>
                    </div>

                    {/* Station + fuel + price */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${brandColors[report.station] || "bg-zinc-400"}`} />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        {report.station} — {report.fuelType}
                      </span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                        ${report.price.toLocaleString("es-AR")}
                      </span>
                    </div>

                    {/* Region */}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                      <span className="text-[11px] text-zinc-400">{report.region}</span>
                    </div>
                  </div>

                  {/* Like button */}
                  <button className="flex items-center gap-1 px-2 py-1 rounded-md text-zinc-400 hover:text-accent-green hover:bg-accent-green/10 transition-colors shrink-0">
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{report.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Input para nuevo reporte */}
          <div className="px-3 py-3 bg-surface-50 dark:bg-dark-surface border-t border-surface-200 dark:border-dark-border">
            <div className="flex gap-2">
              <div className="flex-1 flex gap-1.5">
                <select className="flex-1 text-xs px-2 py-2 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300">
                  <option>Estación</option>
                  <option>YPF</option>
                  <option>Shell</option>
                  <option>Axion</option>
                  <option>Puma</option>
                </select>
                <input
                  type="number"
                  placeholder="$ Precio"
                  className="w-20 text-xs px-2 py-2 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 tabular-nums"
                />
              </div>
              <button className="px-3 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-zinc-400 mt-1.5 text-center">
              Solo usuarios verificados pueden reportar precios
            </p>
          </div>
        </>
      )}
    </div>
  );
}
