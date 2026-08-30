"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { MapPin, Locate, Minus, Plus, Search, Navigation, ChevronDown, ChevronUp, Fuel, ExternalLink } from "lucide-react";
import { api, StationDto, UserLocation } from "@/services/api";
import { trackEvent } from "@/services/analytics";

const fallbackStations: StationDto[] = [];

const brandColors: Record<string, string> = {
  ypf: "#0B3D91",
  shell: "#FFD500",
  axion: "#6B2D8B",
  puma: "#008C45",
  dapsa: "#F97316",
  gulf: "#3B82F6",
  blanca: "#71717A",
};

const brands = [
  { id: "all", label: "Todas las marcas", color: "#888" },
  { id: "ypf", label: "YPF", color: "#0B3D91" },
  { id: "shell", label: "Shell", color: "#FFD500" },
  { id: "axion", label: "Axion", color: "#6B2D8B" },
  { id: "puma", label: "Puma", color: "#008C45" },
];

const fuelTypeKeys: Record<string, { label: string; key: "super" | "premium" | "diesel" | "gnc" }> = {
  super: { label: "Nafta Súper", key: "super" },
  premium: { label: "Nafta Premium", key: "premium" },
  diesel: { label: "Diesel", key: "diesel" },
  gnc: { label: "GNC", key: "gnc" },
};

export default function StationMap({ userLocation, onUserLocation }: { userLocation?: UserLocation; onUserLocation?: (location: UserLocation) => void }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [loaded, setLoaded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("super");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showList, setShowList] = useState<boolean>(false);
  const [rawStations, setRawStations] = useState<any[]>(fallbackStations);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) setShowList(true);
  }, [searchQuery]);

  // Consultar la base de datos al buscar, para no limitarse a las estaciones ya visibles.
  useEffect(() => {
    let active = true;
    async function loadStations() {
      try {
        const data = await api.getStations(selectedBrand === "all" ? undefined : selectedBrand, undefined, userLocation, debouncedSearch);
        if (active) setRawStations(data);
      } catch (err) {
        console.warn("[Map] Error al cargar estaciones:", err);
      }
    }
    loadStations();
    return () => { active = false; };
  }, [selectedBrand, userLocation, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearch) trackEvent("search_performed", { query_length: debouncedSearch.length, scope: "stations" });
  }, [debouncedSearch]);

  // Filtrar estaciones en memoria por búsqueda
  const filteredStations = useMemo(() => {
    return rawStations.filter((st) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = (st.name || "").toLowerCase().includes(q);
      const addressMatch = (st.address || "").toLowerCase().includes(q);
      const cityMatch = (st.city || "").toLowerCase().includes(q);
      const provMatch = (st.province || "").toLowerCase().includes(q);
      const brandMatch = (st.brandName || st.brand || "").toLowerCase().includes(q);
      return nameMatch || addressMatch || cityMatch || provMatch || brandMatch;
    });
  }, [rawStations, searchQuery]);

  const addMarkers = useCallback((stationsToRender: any[], fuelKey: "super" | "premium" | "diesel" | "gnc") => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!L || !map || !group) return;

    group.clearLayers();

    const fuelMeta = fuelTypeKeys[fuelKey] || fuelTypeKeys.super;

    stationsToRender.forEach((station) => {
      if (!station.lat || !station.lng) return;
      const color = brandColors[station.brand] || "#666";
      const currentPrice = station.prices?.[fuelMeta.key];
      const priceText = currentPrice ? `$${currentPrice.toLocaleString("es-AR")}` : "-";

      const svgIcon = L.divIcon({
        className: '',
        html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;position:relative;">
          <div style="width:28px;height:28px;background:${color};border:2.5px solid #fff;border-radius:50%;box-shadow:0 3px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:bold;">
          </div>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([station.lat, station.lng], {
        icon: svgIcon,
      });

      const superP = station.prices?.super ? `$${station.prices.super.toLocaleString("es-AR")}` : "N/D";
      const premP = station.prices?.premium ? `$${station.prices.premium.toLocaleString("es-AR")}` : "N/D";
      const diesP = station.prices?.diesel ? `$${station.prices.diesel.toLocaleString("es-AR")}` : "N/D";
      const gncP = station.prices?.gnc ? `$${station.prices.gnc.toLocaleString("es-AR")}` : "N/D";

      const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`;

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px;padding:4px 0;">
          <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:2px;">${station.name || station.rawName}</div>
          <div style="font-size:11px;color:#666;margin-bottom:6px;">${station.address || ""} ${station.city ? `(${station.city})` : ""}</div>

          <div style="background:#f4f4f6;border-radius:8px;padding:6px 8px;margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;">
            <div><span style="color:#888;">Súper:</span> <strong style="color:#111;">${superP}</strong></div>
            <div><span style="color:#888;">Premium:</span> <strong style="color:#111;">${premP}</strong></div>
            <div><span style="color:#888;">Diesel:</span> <strong style="color:#111;">${diesP}</strong></div>
            <div><span style="color:#888;">GNC:</span> <strong style="color:#111;">${gncP}</strong></div>
          </div>

          <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;width:100%;padding:6px 0;background:#e8a849;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;font-size:11px;text-align:center;">
            🚗 Cómo llegar (Google Maps)
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("popupopen", () => trackEvent("station_viewed", { station_id: station.id, brand: station.brand }));
      group.addLayer(marker);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      if (!(window as any).L) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;

      const L = (window as any).L;
      if (!L || !mapRef.current || mapInstanceRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([-34.5997, -58.4297], 13);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = group;

      setLoaded(true);
    };

    loadLeaflet().catch(console.error);

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      addMarkers(filteredStations, selectedFuel as any);
    }
  }, [filteredStations, selectedFuel, loaded, addMarkers]);

  useEffect(() => {
    if (loaded && userLocation) mapInstanceRef.current?.setView([userLocation.lat, userLocation.lng], 14);
  }, [loaded, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    const coordinates = filteredStations.filter((station) => station.lat !== null && station.lng !== null).map((station) => [station.lat, station.lng]);
    if (loaded && L && map && debouncedSearch && coordinates.length) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [32, 32], maxZoom: 15 });
    }
  }, [loaded, filteredStations, debouncedSearch]);

  const handleLocate = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          map.setView([location.lat, location.lng], 15);
          onUserLocation?.(location);
        },
        () => {
          alert("No se pudo obtener tu ubicación");
        }
      );
    }
  };

  return (
    <div id="mapa" className="bg-white dark:bg-dark-card rounded-2xl border border-surface-200 dark:border-dark-border overflow-hidden shadow-sm">
      {/* Header con Controles y Búsqueda */}
      <div className="px-4 py-3 border-b border-surface-100 dark:border-dark-border space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
              Mapa de Estaciones de Servicio ({filteredStations.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLocate}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 transition-colors"
            >
              <Locate className="w-3.5 h-3.5" />
              <span>Mi ubicación</span>
            </button>
            <button
              onClick={() => setShowList(!showList)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-dark-surface text-zinc-600 dark:text-zinc-300 hover:bg-surface-200"
            >
              <span>{showList ? "Ocultar lista" : "Ver lista"}</span>
              {showList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Buscador de estaciones + Selector de combustible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Bandera, localidad o dirección..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface text-zinc-700 dark:text-zinc-200 outline-none focus:border-brand-primary"
            />
          </div>

          {/* Selector de combustible en el mapa */}
          <div className="flex items-center gap-1 bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border rounded-lg p-0.5">
            {Object.entries(fuelTypeKeys).map(([key, item]) => (
              <button
                key={key}
                onClick={() => setSelectedFuel(key)}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  selectedFuel === key
                    ? "bg-brand-primary text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros por marca */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                selectedBrand === b.id
                  ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                  : "bg-surface-100 dark:bg-dark-surface text-zinc-500 hover:bg-surface-200 dark:hover:bg-dark-border"
              }`}
            >
              {b.id !== "all" && (
                <span className="w-2 h-2 rounded-full" style={{ background: b.color }} />
              )}
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-[400px]" />

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
            aria-label="Acercar mapa"
          >
            <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
            aria-label="Alejar mapa"
          >
            <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>

      {/* Lista desplegable de estaciones */}
      {showList && (
        <div className="p-4 border-t border-surface-200 dark:border-dark-border bg-surface-50 dark:bg-dark-surface max-h-60 overflow-y-auto divide-y divide-surface-100 dark:divide-dark-border">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
            {debouncedSearch ? `Resultados para “${debouncedSearch}”` : userLocation ? "Estaciones más cercanas" : "Estaciones disponibles"} ({fuelTypeKeys[selectedFuel]?.label})
          </h4>
          {filteredStations.slice(0, 20).map((st) => {
            const price = st.prices?.[selectedFuel as "super"];
            return (
              <div key={st.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{st.name || st.rawName}</div>
                  <div className="text-[11px] text-zinc-400">{st.address} {st.city ? `(${st.city})` : ""}{st.distanceKm !== undefined ? ` · ${st.distanceKm.toFixed(1)} km` : ""}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 tabular-nums">
                    {price ? `$${price.toLocaleString("es-AR")}` : "-"}
                  </span>
                  {st.lat && st.lng && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${st.lat},${st.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                      title="Cómo llegar"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
