import { Router, Request, Response } from "express";
import { createWriteStream } from "fs";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Transform } from "stream";
import { pipeline } from "stream/promises";
import { config } from "../config";
import { govIngestionService } from "../services/govIngestionService";
import { requireAdminToken } from "../utils/security";

const router = Router();

// POST /api/admin/imports/res1104
// Carga un ZIP oficial o ACCDB descargado manualmente. Debe ejecutarse desde el VPS.
router.post("/res1104", requireAdminToken, async (req: Request, res: Response) => {
  if (govIngestionService.isSyncInProgress()) return res.status(409).json({ error: "Ya hay una sincronización en curso" });
  const format = req.header("x-naftahoy-import-format")?.toLowerCase();
  if (format !== "zip" && format !== "accdb") return res.status(400).json({ error: "Indicá X-Naftahoy-Import-Format: zip o accdb" });

  let received = 0;
  const contentLength = Number(req.header("content-length") || 0);
  if (contentLength > config.manualImportMaxBytes) return res.status(413).json({ error: "El archivo supera el límite permitido" });

  const workDir = await mkdtemp(join(tmpdir(), "naftahoy-manual-import-"));
  const archivePath = join(workDir, `res1104.${format}`);
  const limiter = new Transform({
    transform(chunk, _encoding, callback) {
      received += chunk.length;
      callback(received > config.manualImportMaxBytes ? new Error("El archivo supera el límite permitido") : null, chunk);
    },
  });

  try {
    await pipeline(req, limiter, createWriteStream(archivePath));
  } catch (error: any) {
    await rm(workDir, { recursive: true, force: true });
    return res.status(error.message?.includes("límite") ? 413 : 400).json({ error: error.message || "No se pudo recibir el archivo" });
  }

  res.status(202).json({ message: "Archivo recibido. La importación mensual se ejecuta en segundo plano; consultá /api/sync/status para conocer el resultado." });
  govIngestionService.syncLatestPrices({ archivePath, format })
    .catch((error) => console.error("[ManualImport] Error inesperado:", error))
    .finally(() => rm(workDir, { recursive: true, force: true }));
});

export default router;
