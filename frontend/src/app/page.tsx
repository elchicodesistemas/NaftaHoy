import Navbar from "@/components/Navbar";
import PriceTable from "@/components/PriceTable";
import QuickCompare from "@/components/QuickCompare";
import MiniTrend from "@/components/MiniTrend";
import StatsBar from "@/components/StatsBar";
import AdBanner from "@/components/AdBanner";
import StationMap from "@/components/StationMap";
import CommunityReports from "@/components/CommunityReports";
import Footer from "@/components/Footer";
import { companies } from "@/data/mockPrices";

export default function Home() {
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
              <h1 className="text-2xl font-extrabold text-zinc-800 dark:text-zinc-100 tracking-tight">
                Precio de la nafta <span className="text-brand-primary">hoy</span>
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 capitalize mt-0.5">
                {dateStr} — Precios actualizados en CABA y GBA
              </p>
            </div>

            {/* Stats rápidas */}
            <div className="mb-5">
              <StatsBar />
            </div>

            {/* Precios por petrolera */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Precios por petrolera
              </h2>
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
                <QuickCompare />
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
                Últimas noticias
              </h2>
              <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border divide-y divide-surface-100 dark:divide-dark-border">
                {[
                  { title: "YPF ajustó precios un 2.3% en todo el país", time: "Hace 3 horas" },
                  { title: "Shell actualizó su lista de precios para CABA", time: "Hace 5 horas" },
                  { title: "El gobierno anunció cambios en impuestos a los combustibles", time: "Ayer" },
                  { title: "Puma Energy sumó 12 estaciones nuevas en GBA", time: "Ayer" },
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
