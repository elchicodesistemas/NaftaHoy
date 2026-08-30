"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2 } from "lucide-react";
import { api, FuelQualityPollResponse } from "@/services/api";
import { trackEvent } from "@/services/analytics";
import BrandLogo from "@/components/BrandLogo";

export default function FuelQualityPoll() {
  const [poll, setPoll] = useState<FuelQualityPollResponse | null>(null);
  const [selected, setSelected] = useState("");
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { api.getFuelQualityPoll().then(setPoll); }, []);
  const vote = async () => {
    if (!selected) return setMessage("Elegí una marca para votar.");
    setLoading(true);
    const response = await api.voteFuelQuality(selected);
    setLoading(false);
    if (response.poll) { setPoll(response.poll); setVoted(true); if (!response.error) trackEvent("fuel_quality_vote", { brand: selected }); }
    setMessage(response.error || "Gracias por compartir tu opinión.");
  };
  if (!poll) return null;
  return <section className="rounded-2xl border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card p-4 shadow-sm" aria-labelledby="fuel-quality-title">
    <div className="flex items-start gap-2 mb-3"><BarChart3 className="w-5 h-5 text-brand-primary mt-0.5" /><div><h2 id="fuel-quality-title" className="text-base font-bold text-zinc-800 dark:text-zinc-100">¿Qué marca ofrece, en tu experiencia, el combustible de mejor calidad?</h2><p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Opiniones de usuarios; no representa una medición técnica u objetiva del combustible.</p></div></div>
    {!voted ? <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{poll.options.map((option) => {
      const isSelected = selected === option.brand;
      return <label key={option.brand} className={`group relative flex min-h-16 items-center gap-3 rounded-xl border p-3 text-sm font-semibold cursor-pointer transition-all ${isSelected ? "border-brand-primary bg-brand-primary/5 shadow-sm ring-1 ring-brand-primary/20" : "border-surface-200 bg-surface-50/60 hover:border-brand-primary/40 hover:bg-white dark:border-dark-border dark:bg-dark-surface dark:hover:bg-dark-card"}`}>
        <input className="sr-only" type="radio" name="fuel-quality" value={option.brand} checked={isSelected} onChange={() => setSelected(option.brand)} />
        <span className="shrink-0 rounded-lg bg-white p-1 shadow-xs ring-1 ring-black/5 dark:bg-zinc-800"><BrandLogo brand={option.brand} size={34} /></span>
        <span className="min-w-0 leading-tight">{option.name}</span>
        <span className={`ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-brand-primary bg-brand-primary text-white" : "border-surface-300 bg-white text-transparent dark:border-zinc-600 dark:bg-zinc-800"}`} aria-hidden="true"><CheckCircle2 className="h-3.5 w-3.5" /></span>
      </label>;
    })}</div> : null}
    {voted ? <div className="space-y-2">{poll.options.map((option) => <div key={option.brand}><div className="flex justify-between text-xs mb-1"><span className="font-semibold">{option.name}</span><span>{option.percentage}% · {option.votes.toLocaleString("es-AR")} votos</span></div><div className="h-2 rounded-full bg-surface-100 dark:bg-dark-surface overflow-hidden"><div className="h-full bg-brand-primary rounded-full" style={{ width: `${option.percentage}%` }} /></div></div>)}</div> : null}
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-zinc-500">Total: {poll.totalVotes.toLocaleString("es-AR")} votos</span>{!voted && <button onClick={vote} disabled={loading} className="rounded-lg bg-brand-primary text-white px-4 py-2 text-sm font-semibold disabled:opacity-50">{loading ? "Registrando…" : "Votar"}</button>}</div>
    {message && <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 flex gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{message}</p>}
  </section>;
}
