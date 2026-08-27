import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";

const router = Router();

// GET /api/reports
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const reports = await priceService.getCommunityReports(limit);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener reportes", details: error.message });
  }
});

// POST /api/reports
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userName, province, city, stationName, brand, fuelType, price } = req.body;
    if (!stationName || !brand || !fuelType || !price) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const report = await priceService.createCommunityReport({
      userName,
      province,
      city,
      stationName,
      brand,
      fuelType,
      price: parseFloat(price),
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Error al crear reporte", details: error.message });
  }
});

// POST /api/reports/:id/like
router.post("/:id/like", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await priceService.likeReport(id);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Error al dar like", details: error.message });
  }
});

export default router;
