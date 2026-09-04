import pino from "pino";
import { env } from "./env.js";

const REDACT_PATHS = [
  "token",
  "*.token",
  "TELEGRAM_BOT_TOKEN",
  "*.TELEGRAM_BOT_TOKEN",
  "password",
  "*.password",
  "authorization",
  "*.authorization",
  "SCAMDECT_API_KEY",
  "*.SCAMDECT_API_KEY",
];

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
  transport:
    env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
      : undefined,
});
