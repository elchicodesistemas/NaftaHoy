import { Request, Response, Router } from "express";
import { sendAdvertisingLead } from "../services/advertisingEmailService";
import { advertisingRateLimit } from "../utils/security";

const router = Router();
const fields = ["name", "business", "email", "phone", "category", "location", "message"] as const;
const limits: Record<(typeof fields)[number], number> = { name: 100, business: 140, email: 254, phone: 60, category: 100, location: 120, message: 2000 };

function clean(value: unknown, key: (typeof fields)[number]) {
  if (typeof value !== "string") return null;
  const result = value.trim().replace(/\s+/g, " ");
  return result.length > 0 && result.length <= limits[key] ? result : null;
}

router.post("/leads", advertisingRateLimit, async (req: Request, res: Response) => {
  // Campo trampa: los usuarios no lo ven, los bots suelen completarlo.
  if (typeof req.body?.website === "string" && req.body.website.trim()) return res.status(202).json({ ok: true });
  const lead = Object.fromEntries(fields.map((field) => [field, clean(req.body?.[field], field)])) as Record<(typeof fields)[number], string | null>;
  if (Object.values(lead).some((value) => !value) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email || "")) {
    return res.status(400).json({ error: "Completá todos los campos con datos válidos." });
  }
  try {
    await sendAdvertisingLead(lead as Record<(typeof fields)[number], string>);
    return res.status(202).json({ ok: true });
  } catch (error: any) {
    if (error.message === "EMAIL_NOT_CONFIGURED") return res.status(503).json({ error: "El envío de consultas todavía no está disponible. Escribinos a publicidad@naftahoy.com." });
    console.error("[Advertising] No se pudo enviar la consulta", error.message);
    return res.status(502).json({ error: "No pudimos enviar tu consulta. Intentá nuevamente o escribinos a publicidad@naftahoy.com." });
  }
});

export default router;
