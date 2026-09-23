import Link from "next/link";
import { MapPin, Fuel, Clock3, ArrowRight } from "lucide-react";
import BrandLogo from "./BrandLogo";
import type { SeoLandingResponse } from "@/services/api";

const pesos = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const fuelLinks = [
  { slug: "nafta-super", label: "Nafta Súper" }, { slug: "nafta-premium", label: "Nafta Premium" },
  { slug: "gasoil", label: "Gasoil" }, { slug: "gnc", label: "GNC" },
];
const cabaNeighborhoods = ["Palermo", "Retiro", "San Telmo", "Recoleta", "Belgrano", "Caballito", "Puerto Madero", "Villa Crespo", "Almagro", "Barracas", "Flores", "Colegiales"];
const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
  const breadcrumbs = data.filters.province
    ? [{ label: "Provincias", href: "/provincias" }, ...(data.filters.city ? [{ label: data.filters.province.name, href: `/${data.filters.province.slug}` }, ...(data.filters.fuel ? [{ label: data.filters.city.name, href: locationHref }] : [])] : [])]
    : data.filters.brand
      ? [{ label: "Petroleras", href: "/petroleras" }, ...(data.filters.fuel ? [{ label: data.filters.brand.name, href: `/${data.filters.brand.slug}` }] : [])]
      : [{ label: "Precios de combustibles", href: "/combustibles" }];
  const currentCrumb = data.filters.fuel?.name || data.filters.city?.name || data.filters.province?.name || data.filters.brand?.name || "Precios";

  return (
    <main className="max-w-content mx-auto px-4 py-8 md:py-12">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs text-ink-3 dark:text-ink-dark-3" aria-label="Navegación de contexto">
        <Link href="/" className="hover:text-accent-ink dark:hover:text-accent">Inicio</Link><span>/</span>
        {breadcrumbs.map((crumb, index) => <span key={`${crumb.label}-${index}`} className="flex items-center gap-2"><span>/</span><Link href={crumb.href} className="hover:text-accent-ink dark:hover:text-accent">{crumb.label}</Link></span>)}
        <span>/</span><span className="text-ink-1 dark:text-ink-dark-1">{currentCrumb}</span>
      </nav>

      <section className="rounded-3xl border border-line bg-gradient-to-br from-panel to-amber-50/70 p-6 shadow-sm dark:border-line-dark dark:from-panel2-dark dark:to-panel-dark md:p-9">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-xl bg-accent/15 p-2.5 text-accent-ink"><Fuel className="h-5 w-5" /></span>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">Precios actualizados</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-1 dark:text-white md:text-4xl">Precio de {subject} hoy</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-2 dark:text-ink-dark-2">
              El precio promedio de la {data.fuel.name} {context ? `${context} ` : ""}es de <strong>{pesos.format(data.stats.average)} por litro</strong>, según los últimos precios oficiales informados.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ["Más barata", data.stats.minimum, "text-emerald-700 dark:text-emerald-400"],
            ["Precio promedio", data.stats.average, "text-ink-1 dark:text-white"],
            ["Más cara", data.stats.maximum, "text-rose-700 dark:text-rose-400"],
          ].map(([label, price, tone]) => (
            <div key={String(label)} className="rounded-2xl border border-line bg-panel/80 p-4 dark:border-line-dark dark:bg-base-dark/50">
              <p className="text-xs font-semibold text-ink-3 dark:text-ink-dark-3">{label}</p>
              <p className={`mt-1 text-2xl font-extrabold ${tone}`}>{pesos.format(Number(price))}<span className="ml-1 text-xs font-semibold">/ litro</span></p>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-3 dark:text-ink-dark-3"><Clock3 className="h-3.5 w-3.5" /> Última actualización: {update}. {data.stats.stations} estaciones consideradas.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-ink-1 dark:text-white">Estaciones más baratas{place ? ` en ${place}` : ""}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel dark:border-line-dark dark:bg-panel2-dark">
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-line2 bg-base px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-ink-3 dark:border-line-dark dark:bg-panel-dark dark:text-ink-dark-3 sm:grid-cols-[auto_1fr_auto]">
            <span className="hidden sm:block">Bandera</span><span>Estación</span><span>Precio</span>
          </div>
          {data.cheapestStations.map((station) => (
            <div key={station.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line2 px-4 py-3 last:border-0 dark:border-line-dark sm:grid-cols-[auto_1fr_auto]">
              <div className="hidden items-center gap-2 sm:flex"><BrandLogo brand={station.brand} size={28} /><span className="text-xs font-semibold text-ink-1 dark:text-ink-dark-1">{station.brandName}</span></div>
              <div><p className="text-sm font-semibold text-ink-1 dark:text-ink-dark-1">{station.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-ink-3"><MapPin className="h-3 w-3" />{station.address}, {station.city}</p></div>
              <strong className="text-sm text-emerald-700 dark:text-emerald-400">{pesos.format(station.price)}</strong>
            </div>
          ))}
        </div>
      </section>

      {data.filters.province && !data.filters.city && data.relatedLocations.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink-1 dark:text-white">Localidades con precios de combustibles en {data.filters.province.name}</h2>
          <p className="mt-1 text-sm text-ink-3 dark:text-ink-dark-3">Elegí una localidad para consultar las estaciones y los precios disponibles.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.relatedLocations.map((location) => <Link key={location.slug} href={`/${data.filters.province!.slug}/${location.slug}`} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-ink-1 transition-colors hover:border-accent hover:text-accent-ink dark:hover:text-accent dark:border-line-dark dark:bg-panel2-dark dark:text-ink-dark-1">{location.name}<ArrowRight className="float-right h-4 w-4" /></Link>)}
          </div>
        </section>
      )}

      {data.filters.province?.slug === "buenos-aires" && !data.filters.city && (
        <section className="mt-10"><h2 className="text-xl font-bold text-ink-1 dark:text-white">Buenos Aires por zona</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{[["interior","Interior de Buenos Aires"],["zona-norte","Zona Norte"],["zona-sur","Zona Sur"],["zona-oeste","Zona Oeste"]].map(([slug, label]) => <Link key={slug} href={`/buenos-aires/${slug}`} className="rounded-xl bg-accent/10 px-4 py-4 text-sm font-bold text-accent-ink hover:bg-accent/20">{label}<ArrowRight className="float-right h-4 w-4" /></Link>)}</div></section>
      )}

      {data.filters.province?.slug === "capital-federal" && !data.filters.city && (
        <section className="mt-10"><h2 className="text-xl font-bold text-ink-1 dark:text-white">Precios por barrio en Capital Federal</h2><p className="mt-1 text-sm text-ink-3 dark:text-ink-dark-3">Explorá las principales zonas de la Ciudad de Buenos Aires.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{cabaNeighborhoods.map((neighborhood) => <Link key={neighborhood} href={`/capital-federal/${slugify(neighborhood)}`} className="rounded-xl border border-line bg-panel px-4 py-3 text-sm font-semibold text-ink-1 hover:border-accent hover:text-accent-ink dark:hover:text-accent dark:border-line-dark dark:bg-panel2-dark dark:text-ink-dark-1">{neighborhood}<ArrowRight className="float-right h-4 w-4" /></Link>)}</div></section>
      )}

      {data.filters.city && (
        <section className="mt-10 rounded-2xl border border-line bg-base p-5 dark:border-line-dark dark:bg-panel-dark">
          <h2 className="text-lg font-bold text-ink-1 dark:text-white">Otros combustibles en {data.filters.city.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {fuelLinks.map((fuel) => <Link key={fuel.slug} href={`${locationHref}/${fuel.slug}`} className={`rounded-lg px-3 py-2 text-xs font-bold ${data.filters.fuel?.slug === fuel.slug ? "bg-accent text-white" : "bg-panel text-ink-2 ring-1 ring-line hover:text-accent-ink dark:hover:text-accent dark:bg-panel2-dark dark:text-ink-dark-1 dark:ring-line-dark"}`}>{fuel.label}</Link>)}
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-bold text-ink-1 dark:text-white">Precios por petrolera</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {data.brandAverages.map((brand) => <Link key={brand.id} href={`/${brand.id}/${data.fuel.slug}`} className="flex items-center justify-between rounded-xl border border-line bg-panel p-3 transition-colors hover:border-accent dark:border-line-dark dark:bg-panel2-dark"><span className="flex items-center gap-2"><BrandLogo brand={brand.id} size={26} /><span className="text-sm font-semibold">{brand.name}</span></span><strong>{pesos.format(brand.average)}</strong></Link>)}
          </div>
        </section>
        <section className="rounded-2xl bg-ink-1 p-6 text-white dark:bg-accent">
          <h2 className="text-xl font-bold">¿Cuánto cuesta llenar el tanque?</h2>
          <p className="mt-1 text-sm text-ink-4">Calculado con el precio promedio de esta página.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[40, 50, 60].map((liters) => <div key={liters} className="rounded-xl bg-panel/10 p-3"><p className="text-xs text-ink-4">{liters} litros</p><p className="mt-1 text-sm font-bold">{pesos.format(data.stats.average * liters)}</p></div>)}
          </div>
          <Link href="/#calculadora" className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-amber-300 hover:text-amber-200">Usar calculadora <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </main>
  );
}
