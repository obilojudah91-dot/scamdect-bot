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

const options: pino.LoggerOptions = {
  level: env.LOG_LEVEL,
  redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
};

if (env.NODE_ENV === "development") {
  options.transport = { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } };
}

export const logger = pino(options);
