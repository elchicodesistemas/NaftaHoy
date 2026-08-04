import { companies } from "@/data/mockPrices";
import { BRAND_COLORS, type BrandId } from "@/lib/brands";
import {
  getSortedBySuper,
  getSuperSpread,
  getVariacionPct,
} from "@/lib/priceUtils";
import BrandLogo from "./BrandLogo";

export default function PriceBoard() {
  const sorted = getSortedBySuper(companies);
  const spread = getSuperSpread(companies);

  return (
    <section id="pizarra" className="max-w-content mx-auto px-6 pt-9 pb-2">
      <div className="flex items-baseline justify-between mb-5 gap-2 flex-wrap">
        <h2 className="font-display text-[30px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
          La pizarra
        </h2>
        <span className="text-xs text-ink-4 dark:text-ink-dark-4">
          Nafta Súper · precio por litro · actualizado hoy
        </span>
      </div>

      <div className="bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-[22px] py-3 border-b border-line dark:border-line-dark bg-panel2 dark:bg-panel2-dark">
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4">
            Petrolera
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 text-right">
            Súper
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 text-right">
            Premium
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 text-right">
            Diesel
          </span>
          <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4 text-right">
            Variación
          </span>
        </div>

        {sorted.map((company, i) => {
          const brand = company.id as BrandId;
          const pct = getVariacionPct(company.fuels[0]);
          const up = pct >= 0;
          const isCheapest = i === 0;
          return (
            <div
              key={company.id}
              className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-[22px] py-4 hover:bg-panel2 dark:hover:bg-panel2-dark transition-colors ${
                i < sorted.length - 1
                  ? "border-b border-line2 dark:border-line2-dark"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className="w-1 h-[34px] rounded-sm"
                  style={{ background: BRAND_COLORS[brand] }}
                />
                <BrandLogo brand={brand} size={32} />
                <div>
                  <span className="block text-[15px] font-bold text-ink-1 dark:text-ink-dark-1">
                    {company.name}
                  </span>
                  {isCheapest && (
                    <span className="text-[11px] font-bold tracking-wide text-down dark:text-down-dark">
                      MÁS BARATA HOY
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`font-display text-2xl text-right tabular-nums ${
                  isCheapest
                    ? "text-down dark:text-down-dark"
                    : "text-ink-1 dark:text-ink-dark-1"
                }`}
              >
                ${company.fuels[0].price.toLocaleString("es-AR")}
              </span>
              <span className="font-display text-2xl text-right tabular-nums text-ink-1 dark:text-ink-dark-1">
                ${company.fuels[1].price.toLocaleString("es-AR")}
              </span>
              <span className="font-display text-2xl text-right tabular-nums text-ink-1 dark:text-ink-dark-1">
                ${company.fuels[2].price.toLocaleString("es-AR")}
              </span>
              <span className="text-right">
                <span
                  className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md ${
                    up
                      ? "text-up dark:text-up-dark bg-up-bg dark:bg-up-bg-dark"
                      : "text-down dark:text-down-dark bg-down-bg dark:bg-down-bg-dark"
                  }`}
                >
                  {up ? "+" : ""}
                  {pct.toFixed(1).replace(".", ",")}%
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 mx-1 text-[11px] text-ink-4 dark:text-ink-dark-4">
        Precios de referencia en CABA. La diferencia entre la más barata y la
        más cara hoy es de{" "}
        <span className="text-accent-ink dark:text-accent font-bold">
          ${spread.toLocaleString("es-AR")} por litro
        </span>{" "}
        — unos ${(spread * 50).toLocaleString("es-AR")} en un tanque de 50
        litros.
      </p>
    </section>
  );
}
