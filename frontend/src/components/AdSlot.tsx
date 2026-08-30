"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { api, AdDto } from "@/services/api";
import { getVisitorId } from "@/services/visitor";
import { trackEvent } from "@/services/analytics";

export default function AdSlot({ placement }: { placement: "home-top" | "home-middle" | "station-detail" | "sidebar" }) {
  const [ad, setAd] = useState<AdDto | null>(null);
  const recorded = useRef(false);
  const pathname = usePathname() || "/";
  useEffect(() => { api.getActiveAd(placement).then(setAd); }, [placement]);
  useEffect(() => { if (ad && !recorded.current) { recorded.current = true; api.recordAdEvent(ad.id, "impression", placement, pathname, getVisitorId()); trackEvent("ad_impression", { ad_id: ad.id, placement }); } }, [ad, pathname, placement]);
  if (!ad) return null;
  return <aside className={`overflow-hidden rounded-xl border border-surface-200 dark:border-dark-border bg-white dark:bg-dark-card ${placement === "sidebar" ? "sticky top-20" : ""}`}><span className="block px-2 pt-1 text-[10px] text-zinc-400">Publicidad</span><a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer sponsored" onClick={() => { api.recordAdEvent(ad.id, "click", placement, pathname, getVisitorId()); trackEvent("ad_click", { ad_id: ad.id, placement }); }} className="block p-2">{ad.imageUrl ? <img src={ad.imageUrl} alt={ad.name} className="w-full h-auto rounded-lg" /> : <div className="min-h-20 rounded-lg bg-surface-100 dark:bg-dark-surface flex items-center justify-center text-center p-3 text-sm font-semibold">{ad.campaign.advertiser.name}<br /><span className="text-xs font-normal text-zinc-500">{ad.name}</span></div>}</a></aside>;
}
