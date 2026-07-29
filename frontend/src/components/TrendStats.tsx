import { companies } from "@/data/mockPrices";
import { getSuperSpread } from "@/lib/priceUtils";

export default function TrendStats() {
  const spread = getSuperSpread(companies);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1 bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl px-[22px] py-5 shadow-sm dark:shadow-none flex flex-col justify-center">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4">
          Ahorro posible hoy
        </span>
        <span className="font-display text-[42px] leading-tight text-down dark:text-down-dark tabular-nums">
          ${(spread * 50).toLocaleString("es-AR")}
        </span>
        <span className="text-xs text-ink-3 dark:text-ink-dark-3 text-pretty">
          llenando un tanque de 50 lt en la más barata en vez de la más cara
        </span>
      </div>
      <div className="flex-1 bg-panel dark:bg-panel-dark border border-line dark:border-line-dark rounded-2xl px-[22px] py-5 shadow-sm dark:shadow-none flex flex-col justify-center">
        <span className="text-[11px] font-bold tracking-wider uppercase text-ink-4 dark:text-ink-dark-4">
          Próximo ajuste estimado
        </span>
        {/* TODO: sin fuente de datos todavía — placeholder editorial hasta tener backend/fuente oficial */}
        <span className="font-display text-[42px] leading-tight text-ink-1 dark:text-ink-dark-1">Agosto</span>
        <span className="text-xs text-ink-3 dark:text-ink-dark-3 text-pretty">
          por actualización del impuesto a los combustibles
        </span>
      </div>
    </div>
  );
}
