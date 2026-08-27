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

    const stations = await priceService.getStations({
      brand,
      province,
      city,
      limit,
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
