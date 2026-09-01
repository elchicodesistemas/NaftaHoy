import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import { prisma } from "./config/prisma";
import pricesRouter from "./routes/prices";
import stationsRouter from "./routes/stations";
import reportsRouter from "./routes/reports";
import syncRouter from "./routes/sync";
import importsRouter from "./routes/imports";
import pollsRouter from "./routes/polls";
import adsRouter from "./routes/ads";
import seoRouter from "./routes/seo";
import { initCronWorker } from "./workers/cronWorker";

const app = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Logger simple
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Rutas
app.use("/api/prices", pricesRouter);
app.use("/api/stations", stationsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/sync", syncRouter);
app.use("/api/admin/imports", importsRouter);
app.use("/api/polls", pollsRouter);
app.use("/api/ads", adsRouter);
app.use("/api/seo", seoRouter);

// Health check
app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    const stationsCount = await prisma.station.count();
    const pricesCount = await prisma.priceRecord.count();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      stats: {
        stationsCount,
        pricesCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      error: error.message,
    });
  }
});

// Inicialización del servidor
const server = app.listen(config.port, async () => {
  console.log(`=============================================`);
  console.log(` ⛽ NaftaHoy Backend API corriendo en puerto ${config.port}`);
  console.log(` 📍 Health check: http://localhost:${config.port}/api/health`);
  console.log(` 📊 Resumen precios: http://localhost:${config.port}/api/prices/summary`);
  console.log(` 🗺️  Estaciones: http://localhost:${config.port}/api/stations`);
  console.log(`=============================================`);

  // Iniciar worker de tareas periódicas
  initCronWorker();

  // La fuente RES 1104/2004 se carga manualmente una vez por mes desde el VPS.
  try {
    const count = await prisma.station.count();
    if (count === 0) {
      console.log("[Boot] Base vacía. Esperando la primera carga manual RES 1104/2004.");
    } else {
      console.log(`[Boot] Base de datos lista con ${count} estaciones cargadas.`);
    }
  } catch (err) {
    console.warn("[Boot] No se pudo verificar conteo inicial:", err);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nCerrando servidor...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Servidor cerrado correctamente.");
    process.exit(0);
  });
});
