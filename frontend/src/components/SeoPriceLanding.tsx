import Link from "next/link";
import { MapPin, Fuel, Clock3, ArrowRight } from "lucide-react";
import BrandLogo from "./BrandLogo";
import type { SeoLandingResponse } from "@/services/api";

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function locationLabel(data: SeoLandingResponse) {
  return [data.filters.city?.name, data.filters.province?.name].filter(Boolean).join(", ");
}

export default function SeoPriceLanding({ data }: { data: SeoLandingResponse }) {
  const place = locationLabel(data);
  const context = [data.filters.brand?.name, place].filter(Boolean).join(" en ");
  const subject = `${data.fuel.name}${context ? ` de ${context}` : ""}`;
  const update = new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(data.stats.lastUpdated));
  const locationHref = data.filters.province
    ? `/${data.filters.province.slug}${data.filters.city ? `/${data.filters.city.slug}` : ""}`
    : "/";

  return (
    <main className="max-w-content mx-auto px-4 py-8 md:py-12">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400" aria-label="Navegación de contexto">
        <Link href="/" className="hover:text-brand-dark">Inicio</Link><span>/</span>
        {data.filters.province && <><Link href={`/${data.filters.province.slug}`} className="hover:text-brand-dark">{data.filters.province.name}</Link><span>/</span></>}
        {data.filters.city && <><Link href={locationHref} className="hover:text-brand-dark">{data.filters.city.name}</Link><span>/</span></>}
        <span className="text-zinc-700 dark:text-zinc-200">{data.fuel.name}</span>
      </nav>

      <section className="rounded-3xl border border-surface-200 bg-gradient-to-br from-white to-amber-50/70 p-6 shadow-sm dark:border-dark-border dark:from-dark-card dark:to-dark-surface md:p-9">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-xl bg-brand-primary/15 p-2.5 text-brand-dark"><Fuel className="h-5 w-5" /></span>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-dark">Precios actualizados</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white md:text-4xl">Precio de {subject} hoy</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              El precio promedio de la {data.fuel.name} {context ? `${context} ` : ""}es de <strong>{pesos.format(data.stats.average)} por litro</strong>, según los últimos precios oficiales informados.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["Más barata", data.stats.minimum, "text-emerald-700 dark:text-emerald-400"],
            ["Precio promedio", data.stats.average, "text-zinc-900 dark:text-white"],
            ["Más cara", data.stats.maximum, "text-rose-700 dark:text-rose-400"],
          ].map(([label, price, tone]) => (
            <div key={String(label)} className="rounded-2xl border border-surface-200 bg-white/80 p-4 dark:border-dark-border dark:bg-dark-bg/50">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{pesos.format(Number(price))}<span className="ml-1 text-xs font-semibold">/ litro</span></p>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"><Clock3 className="h-3.5 w-3.5" /> Última actualización: {update}. {data.stats.stations} estaciones consideradas.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Estaciones más baratas{place ? ` en ${place}` : ""}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-surface-200 bg-white dark:border-dark-border dark:bg-dark-card">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-surface-100 bg-surface-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:border-dark-border dark:bg-dark-surface dark:text-zinc-400 sm:grid-cols-[auto_1fr_auto]">
            <span className="hidden sm:block">Bandera</span><span>Estación</span><span>Precio</span>
          </div>
          {data.cheapestStations.map((station) => (
            <div key={station.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-surface-100 px-4 py-3 last:border-0 dark:border-dark-border sm:grid-cols-[auto_1fr_auto]">
              <div className="hidden items-center gap-2 sm:flex"><BrandLogo brand={station.brand} size={28} /><span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{station.brandName}</span></div>
              <div><p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{station.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3 w-3" />{station.address}, {station.city}</p></div>
              <strong className="text-sm text-emerald-700 dark:text-emerald-400">{pesos.format(station.price)}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Precios por petrolera</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.brandAverages.map((brand) => <Link key={brand.id} href={`/${brand.id}/${data.fuel.slug}`} className="flex items-center justify-between rounded-xl border border-surface-200 bg-white p-3 transition-colors hover:border-brand-primary dark:border-dark-border dark:bg-dark-card"><span className="flex items-center gap-2"><BrandLogo brand={brand.id} size={26} /><span className="text-sm font-semibold">{brand.name}</span></span><strong>{pesos.format(brand.average)}</strong></Link>)}
          </div>
        </section>
        <section className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-brand-dark">
          <h2 className="text-xl font-bold">¿Cuánto cuesta llenar el tanque?</h2>
          <p className="mt-1 text-sm text-zinc-300">Calculado con el precio promedio de esta página.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[40, 50, 60].map((liters) => <div key={liters} className="rounded-xl bg-white/10 p-3"><p className="text-xs text-zinc-300">{liters} litros</p><p className="mt-1 text-sm font-bold">{pesos.format(data.stats.average * liters)}</p></div>)}
          </div>
          <Link href="/#calculadora" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:text-amber-200">Usar calculadora <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </main>
  );
}
