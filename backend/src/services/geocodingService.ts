import axios from "axios";
import { prisma } from "../config/prisma";
import { config } from "../config";

interface GeocodingCandidate {
  lat?: string;
  lon?: string;
  type?: string;
  category?: string;
  display_name?: string;
  address?: { country_code?: string };
}

interface GeoapifyCandidate {
  properties?: {
    lat?: number;
    lon?: number;
    country_code?: string;
    categories?: string[];
  };
}

export interface GeocodingSummary {
  attempted: number;
  geocoded: number;
  unresolved: number;
  failed: number;
}

export class GeocodingService {
  private running = false;
  private lastSummary: GeocodingSummary | null = null;

  public isRunning() { return this.running; }
  public getStatus() { return { running: this.running, lastSummary: this.lastSummary }; }

  public async geocodeMissingStations(): Promise<GeocodingSummary> {
    const summary = { attempted: 0, geocoded: 0, unresolved: 0, failed: 0 };
    if (!config.geocodingEnabled) return summary;
    if (this.running) throw new Error("Ya hay una geocodificación en curso");
    this.running = true;

    try {
      const stations = await prisma.station.findMany({
        where: {
          address: { not: "Sin dirección" },
          OR: [{ lat: null }, { lng: null }],
        },
        orderBy: { govId: "asc" },
        take: config.geocodingBatchSize,
        select: { id: true, govId: true, name: true, brandName: true, address: true, city: true, province: true },
      });

      for (const station of stations) {
        summary.attempted += 1;
        try {
          const coordinates = await this.lookup({
            brandName: station.brandName,
            operatorName: station.name,
            address: station.address,
            city: station.city,
            province: station.province,
          });
          if (!coordinates) {
            summary.unresolved += 1;
          } else {
            const updated = await prisma.station.updateMany({
              where: { id: station.id, OR: [{ lat: null }, { lng: null }] },
              data: { lat: coordinates.lat, lng: coordinates.lng },
            });
            summary.geocoded += updated.count;
          }
        } catch (error: any) {
          summary.failed += 1;
          console.warn(`[Geocoding] No se pudo geocodificar govId=${station.govId ?? "N/D"}: ${error.message || error}`);
        }
        if (summary.attempted < stations.length) await this.wait(config.geocodingDelayMs);
      }
      this.lastSummary = summary;
      return summary;
    } finally {
      this.running = false;
    }
  }

  public async lookup(station: { brandName: string; operatorName: string; address: string; city: string; province: string }) {
    const location = `${station.address}, ${station.city}, ${station.province}, Argentina`;
    if (config.geocodingProvider === "geoapify") return this.lookupGeoapify(`${station.brandName}, ${location}`, location);
    const searches = [`${station.brandName}, ${location}`, `${station.operatorName}, ${location}`, location];

    for (const query of searches) {
      const response = await axios.get<GeocodingCandidate[]>(config.geocodingUrl, {
        timeout: 20_000,
        headers: { "User-Agent": config.geocodingUserAgent },
        params: { q: query, format: "jsonv2", limit: 5, countrycodes: "ar", addressdetails: 1 },
      });
      const candidate = this.pickCandidate(response.data);
      if (candidate) return candidate;
      await this.wait(config.geocodingDelayMs);
    }
    return null;
  }

  private async lookupGeoapify(primaryQuery: string, fallbackQuery: string) {
    if (!config.geocodingApiKey) throw new Error("GEOCODING_API_KEY no está configurada para Geoapify");
    for (const text of [primaryQuery, fallbackQuery]) {
      const response = await axios.get<{ features?: GeoapifyCandidate[] }>("https://api.geoapify.com/v1/geocode/search", {
        timeout: 20_000,
        params: { text, format: "json", filter: "countrycode:ar", apiKey: config.geocodingApiKey },
      });
      const candidate = this.pickGeoapifyCandidate(response.data.features || []);
      if (candidate) return candidate;
      await this.wait(config.geocodingDelayMs);
    }
    return null;
  }

  public pickCandidate(candidates: GeocodingCandidate[]) {
    const valid = candidates.flatMap((candidate) => {
      const lat = Number(candidate.lat);
      const lng = Number(candidate.lon);
      const inArgentina = candidate.address?.country_code?.toLowerCase() === "ar";
      const withinBounds = lat >= -56 && lat <= -21 && lng >= -74 && lng <= -53;
      return Number.isFinite(lat) && Number.isFinite(lng) && inArgentina && withinBounds
        ? [{ candidate, lat, lng }]
        : [];
    });
    const fuel = valid.find(({ candidate }) => candidate.category === "amenity" && candidate.type === "fuel");
    const selected = fuel || valid[0];
    return selected ? { lat: selected.lat, lng: selected.lng } : null;
  }

  public pickGeoapifyCandidate(candidates: GeoapifyCandidate[]) {
    const valid = candidates.flatMap((candidate) => {
      const lat = Number(candidate.properties?.lat);
      const lng = Number(candidate.properties?.lon);
      const inArgentina = candidate.properties?.country_code?.toLowerCase() === "ar";
      const withinBounds = lat >= -56 && lat <= -21 && lng >= -74 && lng <= -53;
      return Number.isFinite(lat) && Number.isFinite(lng) && inArgentina && withinBounds ? [{ candidate, lat, lng }] : [];
    });
    const fuel = valid.find(({ candidate }) => candidate.properties?.categories?.includes("service.vehicle.fuel"));
    const selected = fuel || valid[0];
    return selected ? { lat: selected.lat, lng: selected.lng } : null;
  }

  private wait(milliseconds: number) { return new Promise((resolve) => setTimeout(resolve, milliseconds)); }
}

export const geocodingService = new GeocodingService();
