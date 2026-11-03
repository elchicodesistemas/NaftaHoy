"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Ticker from "@/components/Ticker";
import Hero from "@/components/Hero";
import PriceBoard from "@/components/PriceBoard";
import TrendSection from "@/components/TrendSection";
import QuickCompare from "@/components/QuickCompare";
import AdSlot from "@/components/AdSlot";
import FuelQualityPoll from "@/components/FuelQualityPoll";
import StationMap from "@/components/StationMap";
import FuelCalculator from "@/components/FuelCalculator";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";
import { api, PriceSummaryResponse, UserLocation } from "@/services/api";

/** Título de sección con la tipografía display del rediseño. */
function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mb-5 gap-2 flex-wrap">
      <h2 className="font-display text-[30px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">{children}</h2>
      {aside && <span className="text-xs text-ink-4 dark:text-ink-dark-4">{aside}</span>}
    </div>
  );
}

/**
 * Portada con el layout del rediseño (secciones apiladas a ancho completo)
 * sobre los datos y funciones de main: provincia, geolocalización, publicidad,
 * calculadora, comparador, mapa y encuesta.
 */
export default function HomeClient({ initialData, todayLabel }: { initialData: PriceSummaryResponse; todayLabel: string }) {
  const [data, setData] = useState<PriceSummaryResponse>(initialData);
  const [province, setProvince] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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

  const zoneLabel = userLocation ? "Cerca de tu ubicación · 15 km" : province ? `Zona: ${province}` : "Nivel nacional";
  const sourceLabel =
    data.dataSource === "RES_1104_2004"
      ? "Resolución 1104/2004 · actualización mensual"
      : data.dataSource === "LEGACY_RES_314_2016"
      ? "Datos heredados · pendiente de carga mensual oficial"
      : "Modo vista previa";

  return (
    <>
      <Ticker companies={data.companies} />
      <Navbar selectedProvince={province} onSelectProvince={handleProvinceChange} />
      <Hero companies={data.companies} stats={data.stats} province={province} isRealData={data.isRealData} />

      <div className="max-w-content mx-auto px-4 sm:px-6 mt-7">
        <AdSlot placement="home-top" />
      </div>

      <PriceBoard
        companies={data.companies}
        zoneLabel={zoneLabel}
        todayLabel={todayLabel}
        sourceLabel={sourceLabel}
        loading={loading}
        officialData={data.isRealData && data.dataSource === "RES_1104_2004"}
      />

      <div className="max-w-content mx-auto px-4 sm:px-6 mt-9">
        <AdSlot placement="home-middle" />
      </div>

      <TrendSection companies={data.companies} stats={data.stats} />

      {/* Herramientas de main: comparador y calculadora, con la cara del rediseño */}
      <section id="herramientas" className="max-w-content mx-auto px-4 sm:px-6 pt-9 pb-2">
        <SectionTitle aside="Elegí combustible y litros">Compará y calculá</SectionTitle>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 items-start">
          <QuickCompare companies={data.companies} />
          <FuelCalculator companies={data.companies} />
        </div>
      </section>

      <div className="max-w-content mx-auto px-4 sm:px-6 mt-9">
        <AdSlot placement="sidebar" />
      </div>

      <section className="max-w-content mx-auto px-4 sm:px-6 pt-11 pb-2 scroll-mt-20">
        <SectionTitle aside="Buscá por zona, marca o combustible">Estaciones cerca</SectionTitle>
        <StationMap userLocation={userLocation || undefined} onUserLocation={handleUserLocation} />
      </section>

      <div className="max-w-content mx-auto px-4 sm:px-6 mt-9">
        <AdSlot placement="home-middle" />
      </div>

      {/* Encuesta comunitaria al final, después del mapa y sus contenidos */}
      <section className="max-w-content mx-auto px-4 sm:px-6 pt-9 pb-14">
        <FuelQualityPoll />
      </section>

      {/* Widget flotante de reportes comunitarios */}
      <CommunityReports />

      <Footer />
    </>
  );
}
