import { Company } from "@/data/mockPrices";

// En el servidor de Next usamos la red privada de Docker; en el navegador se
// mantiene la URL pública para que las llamadas respeten el proxy y basePath.
const API_BASE = typeof window === "undefined"
  ? process.env.NAFTAHOY_INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface PriceSummaryResponse {
  companies: Company[];
  stats: {
    superAvg: number;
    variationPct: number;
    cheapestBrand: string;
    cheapestPrice: number;
    mostExpensiveBrand: string;
    mostExpensivePrice: number;
    totalStations: number;
    lastUpdated: string;
  };
  isRealData: boolean;
  dataSource: "RES_1104_2004" | "LEGACY_RES_314_2016" | "NONE";
}

export interface StationDto {
  id: string;
  govId?: number;
  name: string;
  rawName: string;
  brand: string;
  brandName: string;
  address: string;
  city: string;
  province: string;
  lat: number | null;
  lng: number | null;
  prices: {
    super: number | null;
    premium: number | null;
    diesel: number | null;
    gnc: number | null;
  };
  lastUpdate: string;
  distanceKm?: number;
}

export interface SeoLandingResponse {
  filters: {
    brand: { slug: string; name: string } | null;
    fuel: { slug: string; name: string } | null;
    province: { slug: string; name: string } | null;
    city: { slug: string; name: string } | null;
  };
  fuel: { slug: string; name: string };
  stats: { average: number; minimum: number; maximum: number; stations: number; lastUpdated: string };
  cheapestStations: { id: string; name: string; brand: string; brandName: string; address: string; city: string; province: string; price: number }[];
  brandAverages: { id: string; name: string; average: number; stations: number }[];
  relatedLocations: { name: string; slug: string }[];
}

export interface SeoLocationDto { province: { name: string; slug: string }; cities: { name: string; slug: string }[]; }

export interface UserLocation { lat: number; lng: number; }
export interface FuelQualityPollResponse { totalVotes: number; options: { brand: string; name: string; votes: number; percentage: number }[]; }
export interface AdDto { id: string; name: string; imageUrl: string | null; destinationUrl: string; placement: string; campaign: { name: string; advertiser: { name: string } }; }

export interface CommunityReportDto {
  id: number;
  userName: string;
  province: string;
  city: string;
  stationName: string;
  brand: string;
  fuelType: string;
  price: number;
  likes: number;
  createdAt: string;
}

export const api = {
  async getSeoLanding(filters: { brand?: string; fuel?: string; province?: string; city?: string }): Promise<SeoLandingResponse | null> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
      const res = await fetch(`${API_BASE}/seo/landing?${params.toString()}`, { next: { revalidate: 3600 } });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  async getSeoLocations(): Promise<SeoLocationDto[]> {
    try {
      const res = await fetch(`${API_BASE}/seo/locations`, { next: { revalidate: 86400 } });
      return res.ok ? await res.json() : [];
    } catch { return []; }
  },
  async getFuelQualityPoll(): Promise<FuelQualityPollResponse | null> {
    try { const res = await fetch(`${API_BASE}/polls/fuel-quality`, { cache: "no-store", credentials: "same-origin" }); return res.ok ? res.json() : null; } catch { return null; }
  },
  async voteFuelQuality(brand: string): Promise<{ poll?: FuelQualityPollResponse; error?: string }> {
    try { const res = await fetch(`${API_BASE}/polls/fuel-quality/vote`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand }) }); const body = await res.json(); return res.ok ? { poll: body } : { poll: body.poll, error: body.error || "No se pudo registrar el voto" }; } catch { return { error: "No se pudo registrar el voto" }; }
  },
  async getActiveAd(placement: string): Promise<AdDto | null> {
    try { const res = await fetch(`${API_BASE}/ads/${encodeURIComponent(placement)}`, { cache: "no-store" }); if (!res.ok) return null; return (await res.json()).ad || null; } catch { return null; }
  },
  async recordAdEvent(adId: string, kind: "impression" | "click", placement: string, pagePath: string, visitorId: string) {
    try { await fetch(`${API_BASE}/ads/${adId}/${kind}`, { method: "POST", keepalive: true, headers: { "Content-Type": "application/json", "X-Naftahoy-Visitor-Id": visitorId }, body: JSON.stringify({ placement, pagePath }) }); } catch { /* La publicidad no debe afectar la navegación. */ }
  },
  async getPriceSummary(province?: string, location?: UserLocation): Promise<PriceSummaryResponse> {
    try {
      const params = new URLSearchParams();
      if (province) params.set("province", province);
      if (location) { params.set("lat", String(location.lat)); params.set("lng", String(location.lng)); params.set("radiusKm", "15"); }
      const url = `${API_BASE}/prices/summary${params.size ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn("[API] No se pudo obtener el resumen de precios:", err);
      return {
        companies: [],
        stats: {
          superAvg: 0, variationPct: 0, cheapestBrand: "-", cheapestPrice: 0, mostExpensiveBrand: "-", mostExpensivePrice: 0,
          totalStations: 0,
          lastUpdated: new Date().toISOString(),
        },
        isRealData: false,
        dataSource: "NONE",
      };
    }
  },

  async getStations(brand?: string, province?: string, location?: UserLocation, search?: string): Promise<StationDto[]> {
    try {
      const params = new URLSearchParams();
      if (brand && brand !== "all") params.append("brand", brand);
      if (province) params.append("province", province);
      if (location) { params.append("lat", String(location.lat)); params.append("lng", String(location.lng)); params.append("radiusKm", "15"); }
      if (search?.trim()) params.append("search", search.trim());
      params.append("limit", "150");

      const res = await fetch(`${API_BASE}/stations?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.stations || [];
    } catch (err) {
      console.warn("[API] Usando fallback para estaciones:", err);
      return [];
    }
  },

  async getTrends(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE}/prices/trends`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async getReports(): Promise<CommunityReportDto[]> {
    try {
      const res = await fetch(`${API_BASE}/reports`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return [];
    }
  },

  async createReport(data: {
    userName: string;
    province: string;
    city: string;
    stationName: string;
    brand: string;
    fuelType: string;
    price: number;
  }): Promise<CommunityReportDto | null> {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("[API] Error al crear reporte:", err);
      return null;
    }
  },

  async likeReport(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reports/${id}/like`, { method: "POST" });
      return res.ok;
    } catch (err) {
      return false;
    }
  },
};
