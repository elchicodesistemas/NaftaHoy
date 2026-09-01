import { prisma } from "../config/prisma";

const BRANDS: Record<string, string> = {
  ypf: "YPF",
  shell: "Shell",
  axion: "Axion Energy",
  puma: "Puma Energy",
};

const FUELS: Record<string, { type: string; name: string }> = {
  "nafta-super": { type: "SUPER", name: "nafta súper" },
  "nafta-premium": { type: "PREMIUM", name: "nafta premium" },
  gasoil: { type: "DIESEL", name: "gasoil" },
  gnc: { type: "GNC", name: "GNC" },
};

const toSlug = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

export class SeoService {
  public async getLanding(filters: { brand?: string; fuel?: string; province?: string; city?: string }) {
    const brand = filters.brand && BRANDS[filters.brand] ? filters.brand : undefined;
    const fuel = filters.fuel && FUELS[filters.fuel] ? filters.fuel : undefined;
    if ((filters.brand && !brand) || (filters.fuel && !fuel)) return null;

    const locations = await prisma.station.findMany({
      select: { province: true, city: true },
      where: brand ? { brand } : undefined,
    });
    const province = filters.province ? this.resolveLocation(locations.map((item) => item.province), filters.province) : undefined;
    if (filters.province && !province) return null;
    const city = filters.city
      ? this.resolveLocation(locations.filter((item) => item.province === province).map((item) => item.city), filters.city)
      : undefined;
    if (filters.city && !city) return null;

    const stationWhere: any = {
      ...(brand ? { brand } : {}),
      ...(province ? { province } : {}),
      ...(city ? { city } : {}),
    };
    const timeSlot = await this.getActiveTimeSlot();
    const latest = await prisma.priceRecord.findFirst({ where: { timeSlot }, orderBy: { effectiveDate: "desc" }, select: { effectiveDate: true } });
    if (!latest) return null;

    const records = await prisma.priceRecord.findMany({
      where: {
        timeSlot,
        effectiveDate: latest.effectiveDate,
        ...(fuel ? { fuelType: FUELS[fuel].type } : {}),
        station: stationWhere,
      },
      select: {
        price: true,
        fuelType: true,
        fuelTypeName: true,
        station: { select: { id: true, name: true, brand: true, brandName: true, address: true, city: true, province: true } },
      },
    });
    if (!records.length) return null;

    const primaryType = fuel ? FUELS[fuel].type : "SUPER";
    const primaryRecords = records.filter((record) => record.fuelType === primaryType);
    const selected = primaryRecords.length ? primaryRecords : records;
    const prices = selected.map((record) => record.price);
    const average = Math.round(prices.reduce((total, price) => total + price, 0) / prices.length);
    const byBrand = Object.entries(BRANDS).flatMap(([id, name]) => {
      const values = selected.filter((record) => record.station.brand === id).map((record) => record.price);
      return values.length ? [{ id, name, average: Math.round(values.reduce((total, price) => total + price, 0) / values.length), stations: values.length }] : [];
    });
    const cheapestStations = [...selected]
      .sort((a, b) => a.price - b.price)
      .slice(0, 10)
      .map((record) => ({
        id: record.station.id,
        name: record.station.name,
        brand: record.station.brand,
        brandName: record.station.brandName,
        address: record.station.address,
        city: record.station.city,
        province: record.station.province,
        price: Math.round(record.price),
      }));
    const relatedLocations = province
      ? [...new Set(locations.filter((item) => item.province === province).map((item) => item.city))]
        .filter((item) => item !== city)
        .sort()
        .map((item) => ({ name: this.displayLocation(item), slug: toSlug(item) }))
      : [];

    return {
      filters: {
        brand: brand ? { slug: brand, name: BRANDS[brand] } : null,
        fuel: fuel ? { slug: fuel, name: FUELS[fuel].name } : null,
        province: province ? { slug: toSlug(province), name: this.displayLocation(province) } : null,
        city: city ? { slug: toSlug(city), name: this.displayLocation(city) } : null,
      },
      fuel: fuel ? { slug: fuel, name: FUELS[fuel].name } : { slug: "nafta-super", name: "nafta súper" },
      stats: {
        average,
        minimum: Math.round(Math.min(...prices)),
        maximum: Math.round(Math.max(...prices)),
        stations: selected.length,
        lastUpdated: latest.effectiveDate.toISOString(),
      },
      cheapestStations,
      brandAverages: byBrand,
      relatedLocations,
    };
  }

  public async getLocations() {
    const stations = await prisma.station.findMany({ select: { province: true, city: true } });
    const provinces = new Map<string, Set<string>>();
    for (const station of stations) {
      const cities = provinces.get(station.province) || new Set<string>();
      cities.add(station.city);
      provinces.set(station.province, cities);
    }
    return [...provinces.entries()].map(([province, cities]) => ({
      province: { name: this.displayLocation(province), slug: toSlug(province) },
      cities: [...cities].sort().map((city) => ({ name: this.displayLocation(city), slug: toSlug(city) })),
    })).sort((a, b) => a.province.name.localeCompare(b.province.name, "es"));
  }

  private async getActiveTimeSlot() {
    const monthly = await prisma.priceRecord.count({ where: { timeSlot: "Mensual" } });
    return monthly > 0 ? "Mensual" : "Diurno";
  }

  private resolveLocation(values: string[], slug: string) {
    return [...new Set(values)].find((value) => toSlug(value) === slug);
  }

  private displayLocation(value: string) {
    if (toSlug(value) === "capital-federal") return "Capital Federal";
    return value.toLowerCase().replace(/(^|\s|[-'])\p{L}/gu, (letter) => letter.toUpperCase());
  }
}

export const seoService = new SeoService();
