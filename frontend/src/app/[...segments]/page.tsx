import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoPriceLanding from "@/components/SeoPriceLanding";
import { api } from "@/services/api";

const fuels = new Set(["nafta-super", "nafta-premium", "gasoil", "gnc"]);
const brands = new Set(["ypf", "shell", "axion", "puma"]);
const priceSlugs: Record<string, string> = { "precio-nafta-super": "nafta-super", "precio-nafta-premium": "nafta-premium", "precio-gasoil": "gasoil", "precio-gnc": "gnc" };

const getLanding = cache(async (segments: string[]) => {
  let filters: { brand?: string; fuel?: string; province?: string; city?: string } | null = null;
  if (segments.length === 1 && priceSlugs[segments[0]]) filters = { fuel: priceSlugs[segments[0]] };
  else if (segments.length === 1 && brands.has(segments[0])) filters = { brand: segments[0] };
  else if (segments.length === 1) filters = { province: segments[0] };
  else if (segments.length === 2 && brands.has(segments[0]) && fuels.has(segments[1])) filters = { brand: segments[0], fuel: segments[1] };
  else if (segments.length === 2) filters = { province: segments[0], city: segments[1] };
  else if (segments.length === 3 && fuels.has(segments[2])) filters = { province: segments[0], city: segments[1], fuel: segments[2] };
  return filters ? api.getSeoLanding(filters) : null;
});

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { segments?: string[] } }): Promise<Metadata> {
  const data = await getLanding(params.segments || []);
  if (!data) return {};
  const place = [data.filters.city?.name, data.filters.province?.name].filter(Boolean).join(", ");
  const brand = data.filters.brand?.name;
  const explicitFuel = data.filters.fuel?.name;
  const title = brand && explicitFuel
    ? `Precio de ${explicitFuel} ${brand} hoy`
    : brand
      ? `Precio de nafta ${brand} hoy`
      : place && explicitFuel
        ? `Precio de ${explicitFuel} hoy en ${place}`
        : place
          ? `Precio de nafta hoy en ${place}`
          : `Precio de ${data.fuel.name} hoy`;
  const description = brand
    ? `Consultá el precio de nafta ${brand} hoy. El promedio informado es $${data.stats.average.toLocaleString("es-AR")} por litro y podés comparar ${data.stats.stations} estaciones.`
    : place
      ? `Precio de ${explicitFuel || "nafta"} hoy en ${place}: promedio de $${data.stats.average.toLocaleString("es-AR")} por litro. Encontrá estaciones y la opción más barata.`
      : `Precio de ${data.fuel.name} hoy: promedio de $${data.stats.average.toLocaleString("es-AR")} por litro. Compará ${data.stats.stations} estaciones y encontrá la más barata.`;
  const path = `/${(params.segments || []).join("/")}`;
  const keywords = [
    `precio ${explicitFuel || "nafta"} hoy`,
    ...(brand ? [`precio nafta ${brand}`, `${brand} precios combustibles`] : []),
    ...(place ? [`precio nafta en ${place}`, `estaciones de servicio en ${place}`] : []),
    "nafta más barata",
    "estaciones de servicio cerca mío",
  ];
  return { title, description, keywords, alternates: { canonical: path }, openGraph: { title, description, url: path, type: "website", locale: "es_AR" } };
}

export default async function SeoLandingPage({ params }: { params: { segments?: string[] } }) {
  const data = await getLanding(params.segments || []);
  if (!data) notFound();
  return <><Navbar /><SeoPriceLanding data={data} /><Footer /></>;
}
