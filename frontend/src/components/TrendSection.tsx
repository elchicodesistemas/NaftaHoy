import TrendChart from "./TrendChart";
import TrendStats from "./TrendStats";

export default function TrendSection() {
  return (
    <section id="tendencia" className="max-w-content mx-auto px-6 pt-9 pb-2">
      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4">
        <TrendChart />
        <TrendStats />
      </div>
    </section>
  );
}
