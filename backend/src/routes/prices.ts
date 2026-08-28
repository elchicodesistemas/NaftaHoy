import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";

const router = Router();

// GET /api/prices/summary
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const province = req.query.province as string | undefined;
    const location = parseLocation(req);
    if (location === null) return res.status(400).json({ error: "lat y lng deben ser números válidos" });
    const summary = await priceService.getSummary(province, location || undefined);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener resumen de precios", details: error.message });
  }
});

// GET /api/prices/trends
router.get("/trends", async (req: Request, res: Response) => {
  try {
    const trends = await priceService.getTrends();
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener tendencias", details: error.message });
  }
});

export default router;

function parseLocation(req: Request) {
  if (req.query.lat === undefined && req.query.lng === undefined) return undefined;
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = req.query.radiusKm === undefined ? undefined : Number(req.query.radiusKm);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || (radiusKm !== undefined && !Number.isFinite(radiusKm))) return null;
  return { lat, lng, radiusKm };
}
