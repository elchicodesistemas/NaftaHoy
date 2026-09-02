import type { Metadata } from "next";
import DirectoryPage from "@/components/DirectoryPage";
export const metadata: Metadata = { title: "Precio de nafta por petrolera", description: "Compará el precio de nafta YPF, Shell, Axion y Puma hoy. Consultá valores por estación y encontrá la alternativa más conveniente.", keywords: ["precio nafta YPF", "precio nafta Shell", "precio nafta Axion", "precio nafta Puma"] };
export default function Page() { return <DirectoryPage title="Precios por petrolera" description="Compará los precios publicados por las principales banderas de la Argentina." items={[{label:"YPF",href:"/ypf"},{label:"Shell",href:"/shell"},{label:"Axion Energy",href:"/axion"},{label:"Puma Energy",href:"/puma"}]} />; }
