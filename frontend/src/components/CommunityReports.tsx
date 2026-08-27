"use client";

import { useState, useEffect } from "react";
import { MessageSquare, X, ChevronUp, MapPin, Clock, ThumbsUp, Send, Fuel } from "lucide-react";
import { api, CommunityReportDto } from "@/services/api";

const brandColors: Record<string, string> = {
  YPF: "bg-blue-600",
  Shell: "bg-yellow-500",
  Axion: "bg-purple-600",
  Puma: "bg-green-600",
  Dapsa: "bg-orange-500",
  Gulf: "bg-blue-400",
};

export default function CommunityReports() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [reports, setReports] = useState<CommunityReportDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [stationBrand, setStationBrand] = useState("YPF");
  const [fuelType, setFuelType] = useState("Nafta Súper");
  const [priceInput, setPriceInput] = useState("");
  const [cityInput, setCityInput] = useState("CABA");

  const loadReports = async () => {
    try {
      const data = await api.getReports();
      if (data && data.length > 0) {
        setReports(data);
      }
    } catch (err) {
      console.warn("[CommunityReports] Error al cargar reportes:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(priceInput);
    if (!priceNum || priceNum <= 0) {
      alert("Por favor ingresá un precio válido");
      return;
    }

    setLoading(true);
    const newReport = await api.createReport({
      userName: "Conductor",
      province: "Buenos Aires",
      city: cityInput || "CABA",
      stationName: `${stationBrand} - ${cityInput}`,
      brand: stationBrand,
      fuelType: fuelType,
      price: priceNum,
    });

    if (newReport) {
      setReports((prev) => [newReport, ...prev]);
      setPriceInput("");
    }
    setLoading(false);
  };

  const handleLike = async (id: number) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
    await api.likeReport(id);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-dark transition-all group"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-sm font-semibold">Reportes</span>
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {reports.length || "•"}
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
            {reports.length}
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
              Precios reportados por usuarios. Compartí el precio que ves en tu estación para ayudar a la comunidad.
            </p>
          </div>

          {/* Reports list */}
          <div className="flex-1 overflow-y-auto" style={{ height: "330px" }}>
            {reports.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                Aún no hay reportes recientes. ¡Sé el primero en reportar un precio!
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  className="px-4 py-3 border-b border-surface-100 dark:border-dark-border last:border-0 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* User + time */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {report.userName}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(report.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      {/* Station + fuel + price */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${brandColors[report.brand] || "bg-zinc-400"}`} />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          {report.brand} — {report.fuelType}
                        </span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                          ${report.price.toLocaleString("es-AR")}
                        </span>
                      </div>

                      {/* Region */}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-zinc-400" />
                        <span className="text-[11px] text-zinc-400">{report.city || report.province}</span>
                      </div>
                    </div>

                    {/* Like button */}
                    <button
                      onClick={() => handleLike(report.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-zinc-400 hover:text-accent-green hover:bg-accent-green/10 transition-colors shrink-0"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{report.likes}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input para nuevo reporte */}
          <form onSubmit={handleSubmit} className="px-3 py-3 bg-surface-50 dark:bg-dark-surface border-t border-surface-200 dark:border-dark-border">
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5">
                <select
                  value={stationBrand}
                  onChange={(e) => setStationBrand(e.target.value)}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300"
                >
                  <option value="YPF">YPF</option>
                  <option value="Shell">Shell</option>
                  <option value="Axion">Axion</option>
                  <option value="Puma">Puma</option>
                  <option value="Dapsa">DAPSA</option>
                </select>

                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300"
                >
                  <option value="Nafta Súper">Nafta Súper</option>
                  <option value="Nafta Premium">Nafta Premium</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Diesel Premium">Diesel Premium</option>
                  <option value="GNC">GNC</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Zona/Barrio"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="$ Precio"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-24 text-xs px-2 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card text-zinc-700 dark:text-zinc-300 tabular-nums font-bold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
