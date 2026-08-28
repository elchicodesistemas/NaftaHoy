import { Company } from "@/data/mockPrices";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
}

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
  async getPriceSummary(province?: string): Promise<PriceSummaryResponse> {
    try {
      const url = province ? `${API_BASE}/prices/summary?province=${encodeURIComponent(province)}` : `${API_BASE}/prices/summary`;
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

  async getStations(brand?: string, province?: string): Promise<StationDto[]> {
    try {
      const params = new URLSearchParams();
      if (brand && brand !== "all") params.append("brand", brand);
      if (province) params.append("province", province);
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
