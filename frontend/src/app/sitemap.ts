import { MetadataRoute } from "next";
import { api } from "@/services/api";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://naftahoy.com";
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/publicidad`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
  const fuelPages = ["precio-nafta-super", "precio-nafta-premium", "precio-gasoil", "precio-gnc"];
  const brandPages = ["ypf", "shell", "axion", "puma"];
  const locations = await api.getSeoLocations();
  const generated: MetadataRoute.Sitemap = [
    ...fuelPages.map((slug) => ({ url: `${baseUrl}/${slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
    ...brandPages.flatMap((brand) => [
      { url: `${baseUrl}/${brand}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
      ...["nafta-super", "nafta-premium", "gasoil", "gnc"].map((fuel) => ({ url: `${baseUrl}/${brand}/${fuel}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.75 })),
    ]),
    ...locations.flatMap(({ province, cities }) => [
      { url: `${baseUrl}/${province.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
      ...cities.flatMap((city) => [
        { url: `${baseUrl}/${province.slug}/${city.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
        ...["nafta-super", "nafta-premium", "gasoil", "gnc"].map((fuel) => ({ url: `${baseUrl}/${province.slug}/${city.slug}/${fuel}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.65 })),
      ]),
    ]),
  ];
  return [...core, ...generated];
}
