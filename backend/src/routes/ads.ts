import { Request, Response, Router } from "express";
import { requireAdminToken } from "../utils/security";
import { AD_PLACEMENTS, AdPlacement, communityService } from "../services/communityService";

const router = Router();
const UUID_PATTERN = /^[0-9a-f-]{36}$/i;
const placement = (value: unknown): AdPlacement | null => typeof value === "string" && (AD_PLACEMENTS as readonly string[]).includes(value) ? value as AdPlacement : null;
const safePath = (value: unknown) => typeof value === "string" && value.startsWith("/") && value.length <= 200 ? value : null;
const optionalVisitor = (value: unknown) => typeof value === "string" && UUID_PATTERN.test(value) ? value : undefined;

router.get("/admin/metrics", requireAdminToken, async (req: Request, res: Response) => {
  const campaignId = typeof req.query.campaignId === "string" ? req.query.campaignId : undefined;
  const adId = typeof req.query.adId === "string" ? req.query.adId : undefined;
  if ((campaignId && !UUID_PATTERN.test(campaignId)) || (adId && !UUID_PATTERN.test(adId)) || (!campaignId && !adId)) return res.status(400).json({ error: "Indicá campaignId o adId válido" });
  try { res.json(await communityService.getAdMetrics({ campaignId, adId })); }
  catch (error: any) { res.status(500).json({ error: "No se pudieron obtener métricas", details: error.message }); }
});

router.get("/:placement", async (req: Request, res: Response) => {
  const target = placement(req.params.placement);
  if (!target) return res.status(400).json({ error: "Placement inválido" });
  try { res.json({ ad: await communityService.getActiveAd(target) }); }
  catch (error: any) { res.status(500).json({ error: "No se pudo consultar publicidad", details: error.message }); }
});

for (const kind of ["impression", "click"] as const) router.post(`/:adId/${kind}`, async (req: Request, res: Response) => {
  const target = placement(req.body?.placement); const pagePath = safePath(req.body?.pagePath);
  if (!UUID_PATTERN.test(req.params.adId) || !target || !pagePath) return res.status(400).json({ error: "Evento publicitario inválido" });
  try { await communityService.recordAdEvent(kind, req.params.adId, target, pagePath, optionalVisitor(req.header("x-naftahoy-visitor-id"))); res.status(204).end(); }
  catch (error: any) { res.status(error.message === "AD_NOT_FOUND" ? 404 : 500).json({ error: "No se pudo registrar el evento" }); }
});

export default router;
