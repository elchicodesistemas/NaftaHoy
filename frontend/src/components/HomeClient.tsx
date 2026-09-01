"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PriceTable from "@/components/PriceTable";
import QuickCompare from "@/components/QuickCompare";
import MiniTrend from "@/components/MiniTrend";
import StatsBar from "@/components/StatsBar";
import AdSlot from "@/components/AdSlot";
import FuelQualityPoll from "@/components/FuelQualityPoll";
import StationMap from "@/components/StationMap";
import FuelCalculator from "@/components/FuelCalculator";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";
import { api, PriceSummaryResponse, UserLocation } from "@/services/api";

export default function HomeClient({ initialData, todayLabel }: { initialData: PriceSummaryResponse; todayLabel: string }) {
  const [data, setData] = useState<PriceSummaryResponse>(initialData);
  const [province, setProvince] = useState<string>("");
  const [selectedFuelTab, setSelectedFuelTab] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const fuelTabs = [
    { id: "all", label: "Todos los combustibles" },
    { id: "super", label: "Nafta Súper" },
    { id: "premium", label: "Nafta Premium" },
    { id: "diesel", label: "Diesel Común" },
    { id: "diesel_premium", label: "Diesel Premium" },
    { id: "gnc", label: "GNC" },
  ];

  const handleProvinceChange = async (newProv: string) => {
    setProvince(newProv);
    setUserLocation(null);
    setLoading(true);
    try {
      const updated = await api.getPriceSummary(newProv || undefined);
      setData(updated);
    } catch (err) {
      console.warn("Error al actualizar provincia:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLocation = useCallback(async (location: UserLocation) => {
    setUserLocation(location);
    setProvince("");
    setLoading(true);
    try { setData(await api.getPriceSummary(undefined, location)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        await handleUserLocation({ lat: coords.latitude, lng: coords.longitude });
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, [handleUserLocation]);

  // Filtrar compañías / combustibles según tab seleccionado
  const displayCompanies = data.companies.map((comp) => {
    if (selectedFuelTab === "all") return comp;
    const filterKeyword =
      selectedFuelTab === "super"
        ? "súper"
        : selectedFuelTab === "premium"
        ? "premium"
        : selectedFuelTab === "diesel"
        ? "diesel"
        : selectedFuelTab === "diesel_premium"
        ? "diesel premium"
        : "gnc";

    const filteredFuels = comp.fuels.filter((f) => {
      const t = f.type.toLowerCase();
      if (selectedFuelTab === "diesel") {
        return t === "diesel" || (t.includes("diesel") && !t.includes("premium"));
      }
      return t.includes(filterKeyword);
    });

    return {
      ...comp,
      fuels: filteredFuels.length > 0 ? filteredFuels : comp.fuels,
    };
  });

  return (
    <>
      <Navbar selectedProvince={province} onSelectProvince={handleProvinceChange} />

      {/* Banner horizontal top */}
      <div className="max-w-content mx-auto px-4 mt-3">
        <AdSlot placement="home-top" />
      </div>

      {/* Layout principal */}
      <div className="max-w-content mx-auto px-4 mt-4">
        <div className="flex gap-4">
          {/* Sidebar izquierdo — Ads */}
          <aside className="hidden lg:block w-[160px] shrink-0">
            <AdSlot placement="sidebar" />
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {/* Encabezado */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                    Precio de la nafta <span className="text-brand-primary">hoy</span>
                  </h1>
                  {data.isRealData && data.dataSource === "RES_1104_2004" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Datos Oficiales
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-zinc-400">
                  {loading ? "Actualizando…" : userLocation ? "Cerca de tu ubicación · 15 km" : province ? `Zona: ${province}` : "Nivel Nacional"}
                </div>
              </div>

              <p className="text-sm text-zinc-400 dark:text-zinc-500 capitalize mt-1">
                {todayLabel} — Precios en surtidor según la última actualización disponible
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="mb-5">
              <StatsBar stats={data.stats} />
            </div>

            {/* Selector de pestañas rápidas por combustible */}
            <div id="precios" className="mb-4">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {fuelTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedFuelTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedFuelTab === tab.id
                        ? "bg-brand-primary text-white shadow-sm"
                        : "bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border text-zinc-600 dark:text-zinc-400 hover:bg-surface-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Precios por petrolera */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Precios por petrolera
                </h2>
                <span className="text-xs text-zinc-400">
                  {data.dataSource === "RES_1104_2004" ? "Resolución 1104/2004 · actualización mensual" : data.dataSource === "LEGACY_RES_314_2016" ? "Datos heredados · pendiente de carga mensual oficial" : "Modo vista previa"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayCompanies.map((company) => (
                  <PriceTable key={company.id} company={company} />
                ))}
                {displayCompanies.length === 0 && <p className="text-sm text-zinc-500">No hay precios oficiales disponibles todavía para esta zona.</p>}
              </div>
            </div>

            {/* Encuesta comunitaria: después de la consulta principal de precios */}
            <div className="mb-6">
              <FuelQualityPoll />
            </div>

            {/* Banner horizontal medio */}
            <div className="mb-6">
              <AdSlot placement="home-middle" />
            </div>

            {/* Comparativa + Tendencia */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Análisis y Tendencia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <QuickCompare companies={data.companies} />
                <MiniTrend />
              </div>
            </div>

            {/* Calculadora de Llenado de Tanque */}
            <div className="mb-6">
              <FuelCalculator companies={data.companies} />
            </div>

            {/* Mapa de estaciones */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Mapa y Localizador de Estaciones
              </h2>
              <StationMap userLocation={userLocation || undefined} onUserLocation={handleUserLocation} />
            </div>

            {/* Banner horizontal */}
            <div className="mb-6">
              <AdSlot placement="home-middle" />
            </div>

          </main>

          {/* Sidebar derecho — Ads */}
          <aside className="hidden lg:block w-[160px] shrink-0 space-y-4">
            <AdSlot placement="sidebar" />
          </aside>
        </div>
      </div>

      {/* Widget flotante de reportes comunitarios */}
      <CommunityReports />

      <Footer />
    </>
  );
}
