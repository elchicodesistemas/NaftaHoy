import { Request, Response, Router } from "express";
import { communityService } from "../services/communityService";
import { ensureVoteIdentity, requireVoteIdentity, voteRateLimit } from "../utils/security";

const router = Router();
router.get("/fuel-quality", ensureVoteIdentity, async (_req: Request, res: Response) => {
  try { res.json(await communityService.getFuelQualityPoll()); }
  catch (error: any) { res.status(500).json({ error: "No se pudo obtener la encuesta", details: error.message }); }
});

router.post("/fuel-quality/vote", requireVoteIdentity, voteRateLimit, async (req: Request, res: Response) => {
  const brand = typeof req.body?.brand === "string" ? req.body.brand.trim().toLowerCase() : "";
  const visitorId = res.locals.voteVisitorId as string;
  if (!brand) return res.status(400).json({ error: "Voto inválido" });
  try { res.status(201).json(await communityService.voteFuelQuality(brand, visitorId)); }
  catch (error: any) {
    if (error.message === "BRAND_NOT_FOUND") return res.status(400).json({ error: "La marca no está disponible" });
    if (error.message === "ALREADY_VOTED") return res.status(409).json({ error: "Ya registramos tu voto. Esta primera versión permite un voto por visitante.", poll: await communityService.getFuelQualityPoll() });
    res.status(500).json({ error: "No se pudo registrar el voto", details: error.message });
  }
});

export default router;
