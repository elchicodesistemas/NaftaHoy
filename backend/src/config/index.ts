import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:3000"],
  syncApiToken: process.env.SYNC_API_TOKEN || "",
  adminApiToken: process.env.ADMIN_API_TOKEN || "",
  reportRateLimitPerHour: parseInt(process.env.REPORT_RATE_LIMIT_PER_HOUR || "5", 10),
  govCsvUrl: process.env.GOV_DATASET_CSV_URL || "http://datos.energia.gob.ar/dataset/1c181390-5045-475e-94dc-410429be4b17/resource/80ac25de-a44a-4445-9215-090cf55cfda5/download/precios-en-surtidor-resolucin-3142016.csv",
  govCkanUrl: process.env.GOV_CKAN_API_URL || "https://datos.energia.gob.ar/api/3/action/datastore_search?resource_id=80ac25de-a44a-4445-9215-090cf55cfda5",
  cronSchedule: process.env.CRON_SYNC_SCHEDULE || "0 */2 * * *",
};
