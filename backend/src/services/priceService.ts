import { prisma } from "../config/prisma";

export interface FuelPriceDto { type: string; price: number; prevPrice: number; }
export interface CompanySummaryDto { id: string; name: string; shortName: string; fuels: FuelPriceDto[]; lastUpdate: string; }

const brands: Record<string, { name: string; shortName: string }> = {
  ypf: { name: "YPF", shortName: "YPF" }, shell: { name: "Shell", shortName: "Shell" },
  axion: { name: "Axion Energy", shortName: "Axion" }, puma: { name: "Puma Energy", shortName: "Puma" },
};
const fuelOrder = ["Nafta Súper", "Nafta Premium", "Diesel", "Diesel Premium", "GNC"];

export class PriceService {
  public async getSummary(province?: string) {
    const whereStation = province ? { province: { contains: province, mode: "insensitive" as const } } : {};
    const rows = await prisma.priceRecord.findMany({
      where: { station: whereStation, timeSlot: { equals: "Diurno", mode: "insensitive" } },
      include: { station: { select: { brand: true } } }, orderBy: { effectiveDate: "desc" },
    });
    if (!rows.length) return this.emptySummary();
    const latest = new Map<string, { current: typeof rows[number]; previous?: typeof rows[number] }>();
    for (const row of rows) {
      const key = `${row.stationId}:${row.fuelType}`; const value = latest.get(key);
      if (!value) latest.set(key, { current: row });
      else if (!value.previous && row.price !== value.current.price) value.previous = row;
    }
    const totals = new Map<string, Map<string, { total: number; prior: number; count: number; priorCount: number; latest: Date }>>();
    for (const { current, previous } of latest.values()) {
      if (!brands[current.station.brand]) continue;
      const byFuel = totals.get(current.station.brand) || new Map();
      const item = byFuel.get(current.fuelTypeName) || { total: 0, prior: 0, count: 0, priorCount: 0, latest: current.effectiveDate };
      item.total += current.price; item.count += 1;
      if (previous) { item.prior += previous.price; item.priorCount += 1; }
      if (current.effectiveDate > item.latest) item.latest = current.effectiveDate;
      byFuel.set(current.fuelTypeName, item); totals.set(current.station.brand, byFuel);
    }
    const companies: CompanySummaryDto[] = Object.keys(brands).flatMap((brand) => {
      const byFuel = totals.get(brand); if (!byFuel) return [];
      let lastUpdate = new Date(0);
      const fuels = fuelOrder.flatMap((name) => {
        const item = byFuel.get(name); if (!item) return [];
        if (item.latest > lastUpdate) lastUpdate = item.latest;
        const price = Math.round(item.total / item.count);
        return [{ type: name, price, prevPrice: item.priorCount ? Math.round(item.prior / item.priorCount) : price }];
      });
      return fuels.length ? [{ id: brand, ...brands[brand], fuels, lastUpdate: lastUpdate.toISOString() }] : [];
    });
    const superPrices = companies.flatMap((company) => company.fuels.filter((f) => f.type === "Nafta Súper").map((f) => ({ brand: company.shortName, price: f.price, prevPrice: f.prevPrice }))).sort((a, b) => a.price - b.price);
    const average = superPrices.length ? Math.round(superPrices.reduce((sum, item) => sum + item.price, 0) / superPrices.length) : 0;
    const priorAverage = superPrices.length ? superPrices.reduce((sum, item) => sum + item.prevPrice, 0) / superPrices.length : 0;
    return { companies, stats: { superAvg: average, variationPct: priorAverage ? Number((((average - priorAverage) / priorAverage) * 100).toFixed(1)) : 0, cheapestBrand: superPrices[0]?.brand || "-", cheapestPrice: superPrices[0]?.price || 0, mostExpensiveBrand: superPrices.at(-1)?.brand || "-", mostExpensivePrice: superPrices.at(-1)?.price || 0, totalStations: await prisma.station.count({ where: whereStation }), lastUpdated: rows[0].effectiveDate.toISOString() }, isRealData: true };
  }

  public async getStations(filters: { brand?: string; province?: string; city?: string; limit?: number }) {
    const where: any = { lat: { not: null }, lng: { not: null } };
    if (filters.brand && filters.brand !== "all") where.brand = filters.brand.toLowerCase();
    if (filters.province) where.province = { contains: filters.province, mode: "insensitive" };
    if (filters.city) where.city = { contains: filters.city, mode: "insensitive" };
    const stations = await prisma.station.findMany({ where, take: Math.min(filters.limit || 50, 200), include: { prices: { where: { timeSlot: { equals: "Diurno", mode: "insensitive" } }, orderBy: { effectiveDate: "desc" } } }, orderBy: { updatedAt: "desc" } });
    return stations.map((station) => {
      const byFuel = new Map<string, number>(); for (const price of station.prices) if (!byFuel.has(price.fuelType)) byFuel.set(price.fuelType, price.price);
      return { id: station.id, govId: station.govId, name: `${station.brandName} - ${station.address}`, rawName: station.name, brand: station.brand, brandName: station.brandName, address: station.address, city: station.city, province: station.province, lat: station.lat, lng: station.lng, prices: { super: byFuel.get("SUPER") || null, premium: byFuel.get("PREMIUM") || null, diesel: byFuel.get("DIESEL") || null, gnc: byFuel.get("GNC") || null }, lastUpdate: station.updatedAt };
    });
  }

  public async getTrends() {
    const since = new Date(); since.setDate(since.getDate() - 6); since.setHours(0, 0, 0, 0);
    const rows = await prisma.priceRecord.findMany({ where: { fuelType: "SUPER", timeSlot: { equals: "Diurno", mode: "insensitive" }, effectiveDate: { gte: since }, station: { brand: { in: Object.keys(brands) } } }, include: { station: { select: { brand: true } } }, orderBy: { effectiveDate: "asc" } });
    const days = new Map<string, Record<string, number[]>>();
    for (const row of rows) { const date = row.effectiveDate.toISOString().slice(0, 10); const bucket = days.get(date) || {}; (bucket[row.station.brand] ||= []).push(row.price); days.set(date, bucket); }
    return [...days.entries()].map(([date, bucket]) => ({ day: new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date(`${date}T12:00:00Z`)), date, ...Object.fromEntries(Object.entries(bucket).map(([brand, values]) => [brand, Math.round(values.reduce((a, b) => a + b, 0) / values.length)])) }));
  }

  public async getCommunityReports(limit = 20) { return prisma.communityReport.findMany({ where: { status: "APPROVED" }, take: Math.min(limit, 50), orderBy: { createdAt: "desc" } }); }
  public async getPendingCommunityReports(limit = 50) { return prisma.communityReport.findMany({ where: { status: "PENDING" }, take: Math.min(limit, 100), orderBy: { createdAt: "asc" } }); }
  public async setCommunityReportStatus(id: number, status: "APPROVED" | "REJECTED") { return prisma.communityReport.update({ where: { id }, data: { status } }); }
  public async createCommunityReport(data: { userName: string; province: string; city: string; stationName: string; brand: string; fuelType: string; price: number; ipHash?: string }) { return prisma.communityReport.create({ data: { userName: data.userName.trim() || "Conductor anónimo", province: data.province.trim() || "No informado", city: data.city.trim() || "No informado", stationName: data.stationName.trim(), brand: data.brand.trim(), fuelType: data.fuelType.trim(), price: data.price, ipHash: data.ipHash, status: "PENDING" } }); }
  public async likeReport(id: number) { const result = await prisma.communityReport.updateMany({ where: { id, status: "APPROVED" }, data: { likes: { increment: 1 } } }); return result.count === 1; }
  private emptySummary() { return { companies: [], stats: { superAvg: 0, variationPct: 0, cheapestBrand: "-", cheapestPrice: 0, mostExpensiveBrand: "-", mostExpensivePrice: 0, totalStations: 0, lastUpdated: new Date(0).toISOString() }, isRealData: false }; }
}

export const priceService = new PriceService();
