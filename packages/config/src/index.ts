import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from monorepo root (3 levels up from packages/config/src)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const monorepoRoot = path.resolve(__dirname, '../../..');
const envPath = path.join(monorepoRoot, '.env');

config({ path: envPath });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  TELEGRAM_BOT_TOKEN: z.string().default(''),
  TELEGRAM_WEBHOOK_SECRET: z.string().default(''),
  
  DATABASE_URL: z.string().default(''),
  
  REDIS_URL: z.string().default(''),
  REDIS_TOKEN: z.string().default(''),
  
  ADMIN_TELEGRAM_IDS: z.string()
    .default('123456789')
    .transform((val) => val.split(',').map((id) => BigInt(id.trim())))
    .pipe(z.array(z.bigint())),
  
  API_URL: z.string().url('API_URL must be a valid URL').default('http://localhost:3000'),
  WEB_APP_URL: z.string().url('WEB_APP_URL must be a valid URL').default('http://localhost:3000'),
  
  // CORS configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).pipe(z.number().min(1)).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
  
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

type EnvSchema = z.infer<typeof envSchema;

export const env = envSchema.parse(process.env);

export type { EnvSchema };
