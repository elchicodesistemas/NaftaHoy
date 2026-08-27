import HomeClient from "@/components/HomeClient";
import { api } from "@/services/api";

export const revalidate = 60; // Revalidación ISR cada 60s

export default async function Home() {
  const initialData = await api.getPriceSummary();

  return <HomeClient initialData={initialData} />;
}
