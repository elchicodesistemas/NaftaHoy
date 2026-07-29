import { companies } from "@/data/mockPrices";
import { BRAND_COLORS } from "@/lib/brands";
import { getVariacionPct } from "@/lib/priceUtils";

function buildItems() {
  return companies.flatMap((c) => [
    { brand: c.id, label: `${c.shortName} ${c.fuels[0].type}`, fuel: c.fuels[0] },
    { brand: c.id, label: `${c.shortName} ${c.fuels[1].type}`, fuel: c.fuels[1] },
  ]);
}

export default function Ticker() {
  const items = buildItems();
  const loop = [...items, ...items];

  return (
    <div className="bg-panel2 dark:bg-panel2-dark border-b border-line2 dark:border-line2-dark overflow-hidden py-2">
      <div className="flex gap-11 whitespace-nowrap w-max animate-marquee">
        {loop.map((item, i) => {
          const pct = getVariacionPct(item.fuel);
          const up = pct >= 0;
          return (
            <span key={i} className="text-xs font-semibold tracking-wide">
              <span style={{ color: (BRAND_COLORS as Record<string, string>)[item.brand] }}>■</span>{" "}
              {item.label}{" "}
              <span className="text-ink-1 dark:text-ink-dark-1 tabular-nums">
                ${item.fuel.price.toLocaleString("es-AR")}
              </span>{" "}
              <span className={up ? "text-up dark:text-up-dark" : "text-down dark:text-down-dark"}>
                {up ? "+" : ""}
                {pct.toFixed(1).replace(".", ",")}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
