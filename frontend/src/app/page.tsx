import HomeClient from "@/components/HomeClient";
import { api } from "@/services/api";

export const revalidate = 60; // Revalidación ISR cada 60s

export default async function Home() {
  const [initialData, seoLocations] = await Promise.all([api.getPriceSummary(), api.getSeoLocations()]);
  const todayLabel = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  return <HomeClient initialData={initialData} seoLocations={seoLocations} todayLabel={todayLabel} />;
}
