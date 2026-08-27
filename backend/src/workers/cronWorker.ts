import cron from "node-cron";
import { govIngestionService } from "../services/govIngestionService";
import { config } from "../config";

export function initCronWorker() {
  console.log(`[Worker] Inicializando cron de sincronización con patrón: "${config.cronSchedule}"`);

  cron.schedule(config.cronSchedule, async () => {
    console.log("[Worker] Ejecutando sincronización programada con Secretaría de Energía...");
    try {
      const res = await govIngestionService.syncLatestPrices();
      console.log(`[Worker] Sincronización programada completada: ${res.records} registros procesados.`);
    } catch (err) {
      console.error("[Worker] Error en sincronización programada:", err);
    }
  });
}
