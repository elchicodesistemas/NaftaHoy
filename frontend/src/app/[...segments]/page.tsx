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
  const context = [data.filters.brand?.name, place].filter(Boolean).join(" en ");
  const title = `Precio de ${data.fuel.name}${context ? ` de ${context}` : ""} hoy`;
  const description = `El precio promedio de la ${data.fuel.name}${context ? ` ${context}` : ""} es $${data.stats.average.toLocaleString("es-AR")} por litro. Compará ${data.stats.stations} estaciones con datos oficiales.`;
  const path = `/${(params.segments || []).join("/")}`;
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: path, type: "website", locale: "es_AR" } };
}

export default async function SeoLandingPage({ params }: { params: { segments?: string[] } }) {
  const data = await getLanding(params.segments || []);
  if (!data) notFound();
  return <><Navbar /><SeoPriceLanding data={data} /><Footer /></>;
}
