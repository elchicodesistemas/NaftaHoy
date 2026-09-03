import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000"],
  syncApiToken: process.env.SYNC_API_TOKEN || "",
  adminApiToken: process.env.ADMIN_API_TOKEN || "",
  reportRateLimitPerHour: parseInt(process.env.REPORT_RATE_LIMIT_PER_HOUR || "5", 10),
  voteTokenSecret: process.env.VOTE_TOKEN_SECRET || "",
  voteCookieName: process.env.VOTE_COOKIE_NAME || "naftahoy_vote",
  voteCookiePath: process.env.VOTE_COOKIE_PATH || "/",
  voteRateLimitPerHour: parseInt(process.env.VOTE_RATE_LIMIT_PER_HOUR || "12", 10),
  res1104ZipUrl: process.env.RES1104_ZIP_URL || "http://res1104.se.gob.ar/adjuntos/precios_eess_2025_en_adelante.zip",
  res1104TableName: process.env.RES1104_TABLE_NAME || "public_vi_access_eess_2025_en_adelante",
  cronSchedule: process.env.CRON_SYNC_SCHEDULE || "",
  manualImportMaxBytes: parseInt(process.env.MANUAL_IMPORT_MAX_BYTES || "2147483648", 10),
  geocodingEnabled: process.env.GEOCODING_ENABLED === "true",
  geocodingUrl: process.env.GEOCODING_URL || "https://nominatim.openstreetmap.org/search",
  geocodingUserAgent: process.env.GEOCODING_USER_AGENT || "NaftaHoy/1.0 (https://naftahoy.com)",
  geocodingBatchSize: Math.max(1, parseInt(process.env.GEOCODING_BATCH_SIZE || "600", 10)),
  geocodingDelayMs: Math.max(1000, parseInt(process.env.GEOCODING_DELAY_MS || "1100", 10)),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  smtpFrom: process.env.SMTP_FROM || "",
  advertisingRecipient: process.env.ADVERTISING_RECIPIENT || "publicidad@naftahoy.com",
  advertisingRateLimitPerHour: parseInt(process.env.ADVERTISING_RATE_LIMIT_PER_HOUR || "3", 10),
};
