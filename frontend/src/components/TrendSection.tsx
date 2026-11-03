import type { Company } from "@/data/mockPrices";
import TrendChart from "./TrendChart";
import TrendStats from "./TrendStats";

interface TrendSectionProps {
  companies: Company[];
  stats: { cheapestBrand: string; cheapestPrice: number; totalStations: number };
}

export default function TrendSection({ companies, stats }: TrendSectionProps) {
  return (
    <section id="tendencia" className="max-w-content mx-auto px-4 sm:px-6 pt-9 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
        <TrendChart />
        <TrendStats companies={companies} stats={stats} />
      </div>
    </section>
  );
}
