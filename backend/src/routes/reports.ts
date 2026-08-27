import { Router, Request, Response } from "express";
import { priceService } from "../services/priceService";
import { clientHash, reportRateLimit, requireAdminToken } from "../utils/security";

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
router.post("/", reportRateLimit, async (req: Request, res: Response) => {
  try {
    const { userName, province, city, stationName, brand, fuelType, price } = req.body;
    const numericPrice = Number(price);
    if (typeof stationName !== "string" || stationName.trim().length < 3 || stationName.length > 120 ||
        typeof brand !== "string" || brand.length > 40 || typeof fuelType !== "string" || fuelType.length > 40 ||
        !Number.isFinite(numericPrice) || numericPrice <= 0 || numericPrice > 50000) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const report = await priceService.createCommunityReport({
      userName,
      province,
      city,
      stationName,
      brand,
      fuelType,
      price: numericPrice,
      ipHash: clientHash(req),
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Error al crear reporte", details: error.message });
  }
});

// GET /api/reports/pending — operación interna, protegida por ADMIN_API_TOKEN.
router.get("/pending", requireAdminToken, async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    res.json(await priceService.getPendingCommunityReports(limit));
  } catch (error: any) {
    res.status(500).json({ error: "Error al obtener reportes pendientes", details: error.message });
  }
});

// PATCH /api/reports/:id/status — acepta APPROVED o REJECTED.
router.patch("/:id/status", requireAdminToken, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const status = req.body?.status;
  if (!Number.isInteger(id) || !["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ error: "Id o estado inválido" });
  }
  try {
    res.json(await priceService.setCommunityReportStatus(id, status));
  } catch (error: any) {
    res.status(404).json({ error: "Reporte no encontrado", details: error.message });
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
