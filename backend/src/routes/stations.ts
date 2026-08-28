import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";

const router = Router();

// GET /api/stations
router.get("/", async (req: Request, res: Response) => {
  try {
    const brand = req.query.brand as string | undefined;
    const province = req.query.province as string | undefined;
    const city = req.query.city as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const location = parseLocation(req);
    if (location === null) return res.status(400).json({ error: "lat y lng deben ser números válidos" });

    const stations = await priceService.getStations({
      brand,
      province,
      city,
      limit,
      location: location || undefined,
    });

    res.json({
      count: stations.length,
      stations,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener estaciones", details: error.message });
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
