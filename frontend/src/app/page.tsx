import Navbar from "@/components/Navbar";
import PriceTable from "@/components/PriceTable";
import QuickCompare from "@/components/QuickCompare";
import MiniTrend from "@/components/MiniTrend";
import StatsBar from "@/components/StatsBar";
import AdBanner from "@/components/AdBanner";
import StationMap from "@/components/StationMap";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";
import { api } from "@/services/api";

export const revalidate = 60; // Revalidar cada 60s en Next.js SSR

export default async function Home() {
  const summaryData = await api.getPriceSummary();
  const companies = summaryData.companies;
  const stats = summaryData.stats;

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Navbar />

      {/* Banner horizontal top */}
      <div className="max-w-content mx-auto px-4 mt-3">
        <AdBanner position="horizontal" />
      </div>

      {/* Layout 3 columnas: Ad | Contenido | Ad */}
      <div className="max-w-content mx-auto px-4 mt-4">
        <div className="flex gap-4">
          {/* Sidebar izquierdo — Ads */}
          <aside className="hidden lg:block w-[160px] shrink-0">
            <AdBanner position="sidebar" size="large" />
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {/* Encabezado */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                  Precio de la nafta <span className="text-brand-primary">hoy</span>
                </h1>
                {summaryData.isRealData && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Datos Oficiales
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 capitalize mt-0.5">
                {dateStr} — Precios actualizados en CABA y GBA
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="mb-5">
              <StatsBar stats={stats} />
            </div>

            {/* Precios por petrolera */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Precios por petrolera
                </h2>
                <span className="text-xs text-zinc-400">
                  {summaryData.isRealData ? "Secretaría de Energía" : "Modo vista previa"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companies.map((company) => (
                  <PriceTable key={company.id} company={company} />
                ))}
              </div>
            </div>

            {/* Banner horizontal medio */}
            <div className="mb-5">
              <AdBanner position="horizontal" />
            </div>

            {/* Comparativa + Tendencia */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Análisis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <QuickCompare companies={companies} />
                <MiniTrend />
              </div>
            </div>

            {/* Mapa de estaciones */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Mapa de estaciones
              </h2>
              <StationMap />
            </div>

            {/* Banner horizontal */}
            <div className="mb-5">
              <AdBanner position="horizontal" />
            </div>

            {/* Últimas noticias */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Últimas noticias y avisos
              </h2>
              <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border divide-y divide-surface-100 dark:divide-dark-border shadow-sm">
                {[
                  { title: "Resolución 314/2016: Estaciones reportan precios vigentes en surtidor", time: "Oficial" },
                  { title: "Shell actualizó su lista de precios de referencia para CABA y GBA", time: "Hoy" },
                  { title: "YPF y Axion mantienen paridad en nafta súper en estaciones centrales", time: "Hoy" },
                  { title: "Puma Energy y estaciones independientes ofrecen mejores precios en corredores norte y oeste", time: "Esta semana" },
                ].map((news) => (
                  <a key={news.title} href="#" className="block px-4 py-3 hover:bg-surface-50 dark:hover:bg-dark-surface transition-colors">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium block">
                      {news.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{news.time}</span>
                  </a>
                ))}
              </div>
            </div>
          </main>

          {/* Sidebar derecho — Ads */}
          <aside className="hidden lg:block w-[160px] shrink-0 space-y-4">
            <AdBanner position="sidebar" size="medium" />
            <AdBanner position="sidebar" size="small" />
          </aside>
        </div>
      </div>

      {/* Panel flotante de reportes comunitarios */}
      <CommunityReports />

      <Footer />
    </>
  );
}
