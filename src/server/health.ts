import express from "express";
import { prisma } from "../db/client.js";
import { logger } from "../config/logger.js";

export function createHealthServer() {
  const app = express();

  app.get("/", async (_req, res) => {
    res.json({
      name: "ScamDect Bot",
      status: "running",
      endpoints: {
        health: "/health",
      },
    });
  });

  app.get("/health", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({ status: "ok", database: "connected" });
    } catch (err) {
      logger.warn({ err }, "Health check DB ping failed, but server is running");
      res.status(200).json({ status: "ok", database: "disconnected" });
    }
  });

  return app;
}
