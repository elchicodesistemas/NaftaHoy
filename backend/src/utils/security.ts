import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { Request, Response, NextFunction } from "express";
import { config } from "../config";

const reportAttempts = new Map<string, { count: number; expiresAt: number }>();
const voteAttempts = new Map<string, { count: number; expiresAt: number }>();
const advertisingAttempts = new Map<string, { count: number; expiresAt: number }>();
const VOTE_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

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

function readCookie(req: Request, name: string) {
  const value = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
  try { return value ? decodeURIComponent(value) : ""; } catch { return ""; }
}

function voteSignature(visitorId: string) {
  return createHmac("sha256", config.voteTokenSecret).update(visitorId).digest("base64url");
}

function validVoteVisitorId(req: Request) {
  if (!config.voteTokenSecret) return null;
  const [visitorId, signature, ...extra] = readCookie(req, config.voteCookieName).split(".");
  if (!visitorId || !signature || extra.length || !/^[0-9a-f-]{36}$/i.test(visitorId)) return null;
  const expected = Buffer.from(voteSignature(visitorId));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received) ? visitorId : null;
}

function issueVoteVisitorId(res: Response) {
  const visitorId = randomUUID();
  res.cookie(config.voteCookieName, `${visitorId}.${voteSignature(visitorId)}`, {
    httpOnly: true,
    secure: config.nodeEnv !== "development",
    sameSite: "lax",
    path: config.voteCookiePath,
    maxAge: VOTE_COOKIE_MAX_AGE_MS,
  });
  return visitorId;
}

export function ensureVoteIdentity(req: Request, res: Response, next: NextFunction) {
  if (!config.voteTokenSecret) return res.status(503).json({ error: "La encuesta no está configurada" });
  res.locals.voteVisitorId = validVoteVisitorId(req) || issueVoteVisitorId(res);
  next();
}

export function requireVoteIdentity(req: Request, res: Response, next: NextFunction) {
  if (!config.voteTokenSecret) return res.status(503).json({ error: "La encuesta no está configurada" });
  const visitorId = validVoteVisitorId(req);
  if (!visitorId) return res.status(401).json({ error: "Actualizá la encuesta antes de votar" });
  res.locals.voteVisitorId = visitorId;
  next();
}

export function voteRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = clientHash(req);
  const now = Date.now();
  const current = voteAttempts.get(key);
  const item = !current || current.expiresAt <= now ? { count: 0, expiresAt: now + 60 * 60 * 1000 } : current;
  if (item.count >= config.voteRateLimitPerHour) return res.status(429).json({ error: "Demasiados intentos de voto. Intentá nuevamente más tarde." });
  item.count += 1;
  voteAttempts.set(key, item);
  next();
}

export function advertisingRateLimit(req: Request, res: Response, next: NextFunction) {
  const key = clientHash(req);
  const now = Date.now();
  const current = advertisingAttempts.get(key);
  const item = !current || current.expiresAt <= now ? { count: 0, expiresAt: now + 60 * 60 * 1000 } : current;
  if (item.count >= config.advertisingRateLimitPerHour) return res.status(429).json({ error: "Recibimos varias consultas desde esta conexión. Intentá nuevamente más tarde." });
  item.count += 1;
  advertisingAttempts.set(key, item);
  next();
}
