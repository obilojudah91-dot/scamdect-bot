import express from "express";
import { prisma } from "../db/client.js";
import { logger } from "../config/logger.js";

export function createHealthServer() {
  const app = express();

  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok" });
    } catch (err) {
      logger.error({ err }, "Health check DB ping failed");
      res.status(503).json({ status: "unhealthy" });
    }
  });

  return app;
}
