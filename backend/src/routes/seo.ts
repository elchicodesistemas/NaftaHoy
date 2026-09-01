import { Request, Response, Router } from "express";
import { seoService } from "../services/seoService";

const router = Router();

router.get("/landing", async (req: Request, res: Response) => {
  try {
    const value = (name: string) => typeof req.query[name] === "string" ? req.query[name] : undefined;
    const landing = await seoService.getLanding({
      brand: value("brand"), fuel: value("fuel"), province: value("province"), city: value("city"),
    });
    if (!landing) return res.status(404).json({ error: "No hay datos para esta consulta" });
    res.setHeader("Cache-Control", "public, max-age=900, s-maxage=3600");
    res.json(landing);
  } catch (error: any) {
    res.status(500).json({ error: "No se pudieron obtener los datos SEO", details: error.message });
  }
});

router.get("/locations", async (_req: Request, res: Response) => {
  try {
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
    res.json(await seoService.getLocations());
  } catch (error: any) {
    res.status(500).json({ error: "No se pudieron obtener las ubicaciones", details: error.message });
  }
});

export default router;
