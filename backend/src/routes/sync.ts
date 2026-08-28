import { Router, Request, Response } from "express";
import { govIngestionService } from "../services/govIngestionService";
import { prisma } from "../config/prisma";
import { requireSyncToken } from "../utils/security";
import { config } from "../config";

const router = Router();

// GET /api/sync/status
router.get("/status", async (req: Request, res: Response) => {
  try {
    const liveStatus = govIngestionService.getLastSyncStatus();
    const lastLogs = await prisma.syncLog.findMany({
      take: 5,
      orderBy: { startedAt: "desc" },
    });

    const stationsCount = await prisma.station.count();
    const pricesCount = await prisma.priceRecord.count();

    res.json({
      ...liveStatus,
      totalStations: stationsCount,
      totalPrices: pricesCount,
      recentLogs: lastLogs,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al consultar estado de sincronización", details: error.message });
  }
});

// POST /api/sync
router.post("/", requireSyncToken, async (req: Request, res: Response) => {
  if (!config.cronSchedule) {
    return res.status(409).json({ error: "La sincronización por URL está desactivada. Realizá la carga mensual con infrastructure/scripts/import-res1104.sh desde el VPS." });
  }
  try {
    // Iniciar sincronización en background o síncrono si se solicita
    const asyncMode = req.query.async === "true";

    if (asyncMode) {
      govIngestionService.syncLatestPrices().catch(console.error);
      return res.json({ message: "Sincronización iniciada en segundo plano" });
    }

    const result = await govIngestionService.syncLatestPrices();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Error al sincronizar datos", details: error.message });
  }
});

export default router;
