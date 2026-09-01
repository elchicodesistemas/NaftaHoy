import DirectoryPage from "@/components/DirectoryPage";
export default function Page() { return <DirectoryPage title="Precios por petrolera" description="Compará los precios publicados por las principales banderas de la Argentina." items={[{label:"YPF",href:"/ypf"},{label:"Shell",href:"/shell"},{label:"Axion Energy",href:"/axion"},{label:"Puma Energy",href:"/puma"}]} />; }
