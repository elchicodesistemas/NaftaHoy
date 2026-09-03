import { Router, Request, Response } from "express";
import { config } from "../config";
import { geocodingService } from "../services/geocodingService";
import { requireAdminToken } from "../utils/security";

const router = Router();

router.get("/status", requireAdminToken, (_req: Request, res: Response) => {
  res.json({ enabled: config.geocodingEnabled, ...geocodingService.getStatus() });
});

router.post("/run", requireAdminToken, (_req: Request, res: Response) => {
  if (!config.geocodingEnabled) return res.status(409).json({ error: "La geocodificación no está habilitada en este entorno" });
  if (geocodingService.isRunning()) return res.status(409).json({ error: "Ya hay una geocodificación en curso" });
  res.status(202).json({ message: "Geocodificación iniciada en segundo plano" });
  geocodingService.geocodeMissingStations()
    .then((summary) => console.log(`[Geocoding] Proceso finalizado: ${JSON.stringify(summary)}`))
    .catch((error) => console.error("[Geocoding] Error inesperado:", error));
});

export default router;
