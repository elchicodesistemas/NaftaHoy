import type { Company, FuelPrice } from "@/data/mockPrices";

/**
 * Helpers de formato y derivados de precio.
 *
 * Ojo: los cálculos "de verdad" (promedios, variación, más barata/más cara)
 * los hace el backend y llegan en `stats` desde `services/api.ts`. Lo que vive
 * acá es formato y derivados de presentación sobre la lista de compañías que
 * ya vino calculada.
 */

export function formatARS(value: number): string {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1).replace(".", ",")}%`;
}

export function getVariacionPct(fuel: FuelPrice): number {
  if (!fuel.prevPrice) return 0;
  return ((fuel.price - fuel.prevPrice) / fuel.prevPrice) * 100;
}

/** Precio del combustible principal (el primero que devuelve la API por marca). */
export function mainFuelPrice(company: Company): number {
  return company.fuels[0]?.price ?? 0;
}

export function getSortedBySuper(companies: Company[]): Company[] {
  return [...companies]
    .filter((c) => mainFuelPrice(c) > 0)
    .sort((a, b) => mainFuelPrice(a) - mainFuelPrice(b));
}

export function getSuperSpread(companies: Company[]): number {
  const sorted = getSortedBySuper(companies);
  if (sorted.length < 2) return 0;
  return mainFuelPrice(sorted[sorted.length - 1]) - mainFuelPrice(sorted[0]);
}

/** Promedio por nombre de combustible, sobre lo que efectivamente vino. */
export function averageByFuelName(companies: Company[], name: string): number {
  const values = companies
    .flatMap((c) => c.fuels.filter((f) => f.type.toLowerCase() === name.toLowerCase()))
    .map((f) => f.price)
    .filter((p) => p > 0);
  if (!values.length) return 0;
  return values.reduce((sum, p) => sum + p, 0) / values.length;
}
