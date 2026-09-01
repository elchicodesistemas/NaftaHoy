import { notFound } from "next/navigation";
import DirectoryPage from "@/components/DirectoryPage";

const zones: Record<string, { label: string; cities: string[] }> = {
  "zona-norte": { label: "Zona Norte", cities: ["Tigre","San Isidro","San Fernando","Vicente López","Pilar","Escobar","San Miguel","José C. Paz","Malvinas Argentinas","Campana","Zárate"] },
  "zona-sur": { label: "Zona Sur", cities: ["Avellaneda","Lanús","Quilmes","Berazategui","Lomas de Zamora","Florencio Varela","Adrogué","Ezeiza","Monte Grande","Banfield"] },
  "zona-oeste": { label: "Zona Oeste", cities: ["Moreno","Morón","Merlo","Ituzaingó","Hurlingham","Haedo","Ramos Mejía","Castelar","General Rodríguez","Luján"] },
  interior: { label: "Interior de Buenos Aires", cities: ["Mar del Plata","La Plata","Bahía Blanca","Tandil","Junín","Olavarría","Pergamino","San Nicolás","Necochea","Chivilcoy","Azul","Trenque Lauquen"] },
};
const slug = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export default function Page({ params }: { params: { zone: string } }) { const zone = zones[params.zone]; if (!zone) notFound(); return <DirectoryPage title={`Precios de combustibles — ${zone.label}`} description={`Seleccioná una localidad de ${zone.label} para ver sus estaciones y precios disponibles.`} items={zone.cities.map((city) => ({ label: city, href: `/buenos-aires/${slug(city)}` }))} />; }
