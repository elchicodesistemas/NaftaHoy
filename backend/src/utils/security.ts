import { createHash, timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

const reportAttempts = new Map<string, { count: number; expiresAt: number }>();

export function clientHash(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress || "unknown").trim();
  return createHash("sha256").update(ip).digest("hex");
}

function requireBearerToken(expectedToken: string, unavailableMessage: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!expectedToken) {
      return res.status(503).json({ error: unavailableMessage });
    }
    const token = req.header("authorization")?.replace(/^Bearer\s+/i, "") || "";
    const expected = Buffer.from(expectedToken);
    const received = Buffer.from(token);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      return res.status(401).json({ error: "No autorizado" });
    }
    next();
  };
}

export const requireSyncToken = requireBearerToken(
  config.syncApiToken,
  "La sincronización manual no está configurada",
);

export const requireAdminToken = requireBearerToken(
  config.adminApiToken,
  "La administración de reportes no está configurada",
);

export function reportRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = clientHash(req);
  const now = Date.now();
  const current = reportAttempts.get(key);
  const item = !current || current.expiresAt <= now ? { count: 0, expiresAt: now + 60 * 60 * 1000 } : current;
  if (item.count >= config.reportRateLimitPerHour) {
    return res.status(429).json({ error: "Límite de reportes alcanzado. Intentá nuevamente más tarde." });
  }
  item.count += 1;
  reportAttempts.set(key, item);
  next();
}
