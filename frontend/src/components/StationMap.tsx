"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { companies } from "@/data/mockPrices";
import { BRAND_COLORS, BRAND_TEXT_ON, type BrandId } from "@/lib/brands";

function priceFor(brand: BrandId) {
  return companies.find((c) => c.id === brand)?.fuels[0].price ?? 0;
}

const stations = [
  { name: "YPF - Av. Libertador 1500", brand: "ypf" as BrandId, lat: -34.5628, lng: -58.4372 },
  { name: "Shell - Av. Santa Fe 3200", brand: "shell" as BrandId, lat: -34.5885, lng: -58.4098 },
  { name: "Axion - Av. Córdoba 4500", brand: "axion" as BrandId, lat: -34.5964, lng: -58.4245 },
  { name: "Puma - Av. Cabildo 2100", brand: "puma" as BrandId, lat: -34.5571, lng: -58.4593 },
  { name: "YPF - Av. Rivadavia 6700", brand: "ypf" as BrandId, lat: -34.6282, lng: -58.4468 },
  { name: "Shell - Av. Callao 1200", brand: "shell" as BrandId, lat: -34.5995, lng: -58.3927 },
  { name: "Axion - Av. Corrientes 5500", brand: "axion" as BrandId, lat: -34.6052, lng: -58.4352 },
  { name: "Puma - Av. Juan B. Justo 3800", brand: "puma" as BrandId, lat: -34.6089, lng: -58.4515 },
];

const filters: { id: "all" | BrandId; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "ypf", label: "YPF" },
  { id: "shell", label: "Shell" },
  { id: "axion", label: "Axion" },
  { id: "puma", label: "Puma" },
];

export default function StationMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const tileDarkRef = useRef<any>(null);
  const tileLightRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [brand, setBrand] = useState<"all" | BrandId>("all");

  const addMarkers = useCallback((selected: "all" | BrandId) => {
    const L = (window as any).L;
    const group = groupRef.current;
    if (!L || !group) return;

    group.clearLayers();

    stations
      .filter((s) => selected === "all" || s.brand === selected)
      .forEach((s) => {
        const color = BRAND_COLORS[s.brand];
        const text = BRAND_TEXT_ON[s.brand];
        const price = priceFor(s.brand);
        const icon = L.divIcon({
          className: "",
          html:
            '<div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 3px 8px rgba(0,0,0,.5));">' +
            '<div style="background:' + color + ';color:' + text + ';font:700 12px Archivo,sans-serif;padding:4px 9px;border-radius:7px;white-space:nowrap;">$' +
            price.toLocaleString("es-AR") +
            "</div>" +
            '<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ' +
            color +
            ';"></div></div>',
          iconSize: [64, 36],
          iconAnchor: [32, 36],
          popupAnchor: [0, -38],
        });

        const marker = L.marker([s.lat, s.lng], { icon });
        marker.bindPopup(
          '<div style="font-family:Archivo,sans-serif;font-size:12px;line-height:1.6;min-width:180px;padding:4px 2px;">' +
            '<strong style="font-size:14px;display:block;margin-bottom:2px;">' + s.name + "</strong>" +
            '<span style="opacity:.6;">Nafta Súper</span><br/>' +
            '<span style="font-size:22px;font-weight:800;color:' + color + ';">$' + price.toLocaleString("es-AR") + "</span>" +
            '<span style="font-size:11px;opacity:.5;"> /litro</span></div>'
        );
        group.addLayer(marker);
      });
  }, []);

  const setTiles = useCallback((isDark: boolean) => {
    const map = mapInstanceRef.current;
    const tileDark = tileDarkRef.current;
    const tileLight = tileLightRef.current;
    if (!map || !tileDark || !tileLight) return;
    if (isDark) {
      map.removeLayer(tileLight);
      tileDark.addTo(map);
    } else {
      map.removeLayer(tileDark);
      tileLight.addTo(map);
    }
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

      const map = L.map(mapRef.current, { zoomControl: false }).setView([-34.5997, -58.4297], 13);
      const attr =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

      tileDarkRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: attr,
        maxZoom: 19,
      });
      tileLightRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: attr,
        maxZoom: 19,
      });

      const isDark = document.documentElement.classList.contains("dark");
      (isDark ? tileDarkRef.current : tileLightRef.current).addTo(map);

      mapInstanceRef.current = map;
      groupRef.current = L.layerGroup().addTo(map);
      setLoaded(true);
    };

    loadLeaflet().catch(console.error);

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        groupRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) addMarkers(brand);
  }, [brand, loaded, addMarkers]);

  useEffect(() => {
    if (!loaded) return;
    const observer = new MutationObserver(() => {
      setTiles(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [loaded, setTiles]);

  const handleLocate = () => {
    const map = mapInstanceRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => alert("No se pudo obtener tu ubicación")
    );
  };

  return (
    <section id="mapa" className="max-w-content mx-auto px-6 pt-11 pb-2">
      <div className="flex items-baseline justify-between mb-5 gap-2.5 flex-wrap">
        <h2 className="font-display text-[30px] tracking-wide uppercase text-ink-1 dark:text-ink-dark-1">
          ¿Dónde cargo más barato?
        </h2>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => {
            const active = brand === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setBrand(f.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide bg-transparent text-ink-2 dark:text-ink-dark-2 transition-colors ${
                  active ? "border-accent" : "border-line dark:border-line-dark"
                }`}
              >
                {f.id !== "all" && (
                  <span
                    className="w-[9px] h-[9px] rounded-[3px] inline-block"
                    style={{ background: BRAND_COLORS[f.id as BrandId] }}
                  />
                )}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-line dark:border-line-dark overflow-hidden relative isolate shadow-sm dark:shadow-none">
        <div ref={mapRef} className="w-full h-[460px]" />

        <div className="absolute top-3.5 right-3.5 z-[500] flex flex-col gap-1.5">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-9 h-9 rounded-[9px] bg-panel dark:bg-panel-dark border border-line dark:border-line-dark flex items-center justify-center hover:border-accent transition-colors"
          >
            <Plus className="w-4 h-4 text-ink-2 dark:text-ink-dark-2" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-9 h-9 rounded-[9px] bg-panel dark:bg-panel-dark border border-line dark:border-line-dark flex items-center justify-center hover:border-accent transition-colors"
          >
            <Minus className="w-4 h-4 text-ink-2 dark:text-ink-dark-2" />
          </button>
        </div>

        <button
          onClick={handleLocate}
          className="absolute bottom-4 left-4 z-[500] flex items-center gap-2 px-4 py-2.5 rounded-[9px] bg-accent text-[#141414] text-xs font-bold uppercase tracking-wide shadow-[0_8px_24px_rgba(0,0,0,.4)] hover:brightness-110 transition-[filter]"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="2" x2="5" y1="12" y2="12" />
            <line x1="19" x2="22" y1="12" y2="12" />
            <line x1="12" x2="12" y1="2" y2="5" />
            <line x1="12" x2="12" y1="19" y2="22" />
            <circle cx="12" cy="12" r="7" />
          </svg>
          <span>Mi ubicación</span>
        </button>
      </div>
    </section>
  );
}
