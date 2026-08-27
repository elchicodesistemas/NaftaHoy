"use client";

import { useState } from "react";
import { Calculator, Fuel, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Company } from "@/data/mockPrices";

interface FuelCalculatorProps {
  companies?: Company[];
}

export default function FuelCalculator({ companies: propCompanies }: FuelCalculatorProps) {
  const currentCompanies = propCompanies || [];

  const [fuelType, setFuelType] = useState<string>("Nafta Súper");
  const [liters, setLiters] = useState<number>(50);

  const presets = [
    { label: "Moto (15L)", val: 15 },
    { label: "Compacto (45L)", val: 45 },
    { label: "Sedán (55L)", val: 55 },
    { label: "SUV / Pickup (75L)", val: 75 },
  ];

  const fuelOptions = [
    "Nafta Súper",
    "Nafta Premium",
    "Diesel",
    "Diesel Premium",
    "GNC",
  ];

  // Calcular precios por petrolera
  const results = currentCompanies
    .map((c) => {
      const targetFuel = c.fuels.find((f) => f.type.toLowerCase() === fuelType.toLowerCase()) ||
        c.fuels.find((f) => f.type.toLowerCase().includes(fuelType.toLowerCase().split(" ")[0])) ||
        c.fuels[0];

      const unitPrice = targetFuel ? targetFuel.price : 0;
      const totalPrice = unitPrice * liters;

      return {
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        unitPrice,
        totalPrice,
      };
    })
    .filter((r) => r.unitPrice > 0)
    .sort((a, b) => a.totalPrice - b.totalPrice);

  const cheapest = results[0];
  const mostExpensive = results[results.length - 1];
  const maxSavings = mostExpensive && cheapest ? mostExpensive.totalPrice - cheapest.totalPrice : 0;

  return (
    <div id="calculadora" className="bg-white dark:bg-dark-card rounded-2xl border border-surface-200 dark:border-dark-border p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-surface-100 dark:border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">
              Calculadora de Llenado de Tanque
            </h3>
            <p className="text-xs text-zinc-400">
              Estimá cuánto te cuesta llenar el tanque y cuánto podés ahorrar
            </p>
          </div>
        </div>

        {maxSavings > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ahorro máx: ${Math.round(maxSavings).toLocaleString("es-AR")}</span>
          </div>
        )}
      </div>

      {/* Controles: Combustible y Litros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Selector de combustible */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            Tipo de combustible
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {fuelOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFuelType(f)}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                  fuelType === f
                    ? "bg-brand-primary text-white font-semibold shadow-sm"
                    : "bg-surface-100 dark:bg-dark-surface text-zinc-600 dark:text-zinc-400 hover:bg-surface-200 dark:hover:bg-dark-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Capacidad del tanque */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Capacidad a cargar
            </label>
            <span className="text-sm font-extrabold text-brand-primary tabular-nums">
              {liters} Litros
            </span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="10"
            max="120"
            step="1"
            value={liters}
            onChange={(e) => setLiters(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-surface-200 dark:bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-primary mb-2.5"
          />

          {/* Presets rápidos */}
          <div className="flex gap-1.5 flex-wrap">
            {presets.map((p) => (
              <button
                key={p.val}
                onClick={() => setLiters(p.val)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  liters === p.val
                    ? "bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900"
                    : "bg-surface-100 dark:bg-dark-surface text-zinc-500 hover:bg-surface-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resultados por petrolera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-surface-100 dark:border-dark-border">
        {results.map((item, idx) => {
          const isBest = idx === 0;
          return (
            <div
              key={item.id}
              className={`rounded-xl p-3.5 border transition-all ${
                isBest
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 shadow-sm"
                  : "bg-surface-50 dark:bg-dark-surface border-surface-200 dark:border-dark-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  {item.name}
                </span>
                {isBest && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    MEJOR OPCIÓN
                  </span>
                )}
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                ${item.unitPrice.toLocaleString("es-AR")} /litro
              </div>

              <div className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100 tabular-nums">
                ${Math.round(item.totalPrice).toLocaleString("es-AR")}
              </div>

              {idx > 0 && cheapest && (
                <div className="text-[11px] text-accent-red font-medium mt-1">
                  +${Math.round(item.totalPrice - cheapest.totalPrice).toLocaleString("es-AR")} vs {cheapest.shortName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
