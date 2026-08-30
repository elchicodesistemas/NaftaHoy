import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";
import { communityService } from "../services/communityService";

const router = Router();
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/:id/ratings", async (req: Request, res: Response) => {
  if (!UUID_PATTERN.test(req.params.id)) return res.status(400).json({ error: "Estación inválida" });
  try { res.json(await communityService.getStationRatingSummary(req.params.id)); }
  catch (error: any) { res.status(500).json({ error: "No se pudieron obtener las valoraciones", details: error.message }); }
});

router.post("/:id/ratings", async (req: Request, res: Response) => {
  const visitorId = req.header("x-naftahoy-visitor-id") || "";
  const values = ["fuelQuality", "service", "cleanliness", "speed"].reduce((result: Record<string, number>, field) => ({ ...result, [field]: Number(req.body?.[field]) }), {});
  if (!UUID_PATTERN.test(req.params.id) || !UUID_PATTERN.test(visitorId) || Object.values(values).some((value) => !Number.isInteger(value) || value < 1 || value > 5)) return res.status(400).json({ error: "Valoración inválida" });
  try { res.status(201).json(await communityService.createStationRating(req.params.id, visitorId, values as { fuelQuality: number; service: number; cleanliness: number; speed: number })); }
  catch (error: any) {
    if (error.message === "STATION_NOT_FOUND") return res.status(404).json({ error: "Estación no encontrada" });
    if (error.message === "ALREADY_RATED") return res.status(409).json({ error: "Ya registramos una valoración para esta estación" });
    res.status(500).json({ error: "No se pudo registrar la valoración", details: error.message });
  }
});

// GET /api/stations
router.get("/", async (req: Request, res: Response) => {
  try {
    const brand = req.query.brand as string | undefined;
    const province = req.query.province as string | undefined;
    const city = req.query.city as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const location = parseLocation(req);
    if (location === null) return res.status(400).json({ error: "lat y lng deben ser números válidos" });

    const stations = await priceService.getStations({
      brand,
      province,
      city,
      search,
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
