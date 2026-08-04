import type { Company, FuelPrice } from "@/data/mockPrices";

export function getSortedBySuper(companies: Company[]): Company[] {
  return [...companies].sort((a, b) => a.fuels[0].price - b.fuels[0].price);
}

export function getCheapestCompany(companies: Company[]): Company {
  return getSortedBySuper(companies)[0];
}

export function getPriciestCompany(companies: Company[]): Company {
  return getSortedBySuper(companies)[companies.length - 1];
}

export function getSuperSpread(companies: Company[]): number {
  return (
    getPriciestCompany(companies).fuels[0].price -
    getCheapestCompany(companies).fuels[0].price
  );
}

export function getVariacionPct(fuel: FuelPrice): number {
  return ((fuel.price - fuel.prevPrice) / fuel.prevPrice) * 100;
}

export function getAveragePrices(companies: Company[]) {
  const avg = (index: number) =>
    companies.reduce((sum, c) => sum + c.fuels[index].price, 0) /
    companies.length;
  return {
    super: avg(0),
    premium: avg(1),
    diesel: avg(2),
    gnc: avg(4),
  };
}
