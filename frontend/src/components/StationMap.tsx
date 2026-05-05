"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Locate, Minus, Plus } from "lucide-react";

const mockStations = [
  { id: 1, name: "YPF - Av. Libertador 1500", brand: "ypf", lat: -34.5628, lng: -58.4372, nafta: 1999 },
  { id: 2, name: "Shell - Av. Santa Fe 3200", brand: "shell", lat: -34.5885, lng: -58.4098, nafta: 2099 },
  { id: 3, name: "Axion - Av. Córdoba 4500", brand: "axion", lat: -34.5964, lng: -58.4245, nafta: 2039 },
  { id: 4, name: "Puma - Av. Cabildo 2100", brand: "puma", lat: -34.5571, lng: -58.4593, nafta: 1979 },
  { id: 5, name: "YPF - Av. Rivadavia 6700", brand: "ypf", lat: -34.6282, lng: -58.4468, nafta: 1999 },
  { id: 6, name: "Shell - Av. Callao 1200", brand: "shell", lat: -34.5995, lng: -58.3927, nafta: 2099 },
  { id: 7, name: "Axion - Av. Corrientes 5500", brand: "axion", lat: -34.6052, lng: -58.4352, nafta: 2039 },
  { id: 8, name: "Puma - Av. Juan B. Justo 3800", brand: "puma", lat: -34.6089, lng: -58.4515, nafta: 1979 },
];

const brandColors: Record<string, string> = {
  ypf: "#0B3D91",
  shell: "#FFD500",
  axion: "#6B2D8B",
  puma: "#008C45",
};

const brands = [
  { id: "all", label: "Todas", color: "#888" },
  { id: "ypf", label: "YPF", color: "#0B3D91" },
  { id: "shell", label: "Shell", color: "#FFD500" },
  { id: "axion", label: "Axion", color: "#6B2D8B" },
  { id: "puma", label: "Puma", color: "#008C45" },
];

export default function StationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const addMarkers = useCallback((brand: string) => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!L || !map || !group) return;

    // Limpiar el grupo de markers
    group.clearLayers();

    const filtered = brand === "all"
      ? mockStations
      : mockStations.filter((s) => s.brand === brand);

    filtered.forEach((station) => {
      const color = brandColors[station.brand] || "#666";

      // Crear ícono SVG personalizado por marca
      const svgIcon = L.divIcon({
        className: '',
        html: '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' +
          '<div style="width:28px;height:28px;background:' + color + ';border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>' +
        '</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([station.lat, station.lng], {
        icon: svgIcon,
      });

      marker.bindPopup(
        '<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.6;min-width:170px;padding:4px 0;">' +
          '<strong style="font-size:14px;display:block;margin-bottom:4px;">' + station.name + '</strong>' +
          '<span style="color:#888;">Nafta Súper</span><br/>' +
          '<span style="font-size:20px;font-weight:800;color:' + color + ';">$' + station.nafta.toLocaleString() + '</span>' +
          '<span style="font-size:11px;color:#aaa;"> /litro</span>' +
        '</div>'
      );

      group.addLayer(marker);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const loadLeaflet = async () => {
      // CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);
      }

      // JS
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

      // Crear un LayerGroup para los markers
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

  // Actualizar markers cuando cambia el filtro o cuando se carga el mapa
  useEffect(() => {
    if (loaded) {
      addMarkers(selectedBrand);
    }
  }, [selectedBrand, loaded, addMarkers]);

  const handleLocate = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        },
        () => {
          alert("No se pudo obtener tu ubicación");
        }
      );
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-surface-200 dark:border-dark-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-surface-100 dark:border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Estaciones cercanas
            </h3>
          </div>
          <button
            onClick={handleLocate}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-accent-blue hover:bg-accent-blue/10 transition-colors"
          >
            <Locate className="w-3 h-3" />
            Mi ubicación
          </button>
        </div>

        {/* Filtros por marca */}
        <div className="flex gap-1.5">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedBrand === b.id
                  ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-800"
                  : "bg-surface-100 dark:bg-dark-border text-zinc-500 dark:text-zinc-400 hover:bg-surface-200 dark:hover:bg-dark-surface"
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
        <div ref={mapRef} className="w-full h-[380px]" />

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded-lg bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border flex items-center justify-center shadow-sm hover:bg-surface-50 transition-colors"
          >
            <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
