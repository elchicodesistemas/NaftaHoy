import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";

const router = Router();

// GET /api/prices/summary
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const province = req.query.province as string | undefined;
    const summary = await priceService.getSummary(province);
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
