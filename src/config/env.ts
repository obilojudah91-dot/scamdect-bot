import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, "TELEGRAM_BOT_TOKEN is required"),
  TELEGRAM_ADMIN_IDS: z
    .string()
    .default("")
    .transform((val) =>
      val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  TELEGRAM_USE_WEBHOOK: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  TELEGRAM_WEBHOOK_URL: z.string().url().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  REDIS_URL: z.string().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  SCAMDECT_API_URL: z.string().url().optional(),
  SCAMDECT_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast, never leak values — only field names/issues
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
  // eslint-disable-next-line no-console
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

if (parsed.data.TELEGRAM_USE_WEBHOOK && !parsed.data.TELEGRAM_WEBHOOK_URL) {
  // eslint-disable-next-line no-console
  console.error("TELEGRAM_WEBHOOK_URL is required when TELEGRAM_USE_WEBHOOK=true");
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
