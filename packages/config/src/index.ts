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

type EnvSchema = z.infer<typeof envSchema>;

function validateEnv(): EnvSchema {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // In development, log warnings but don't fail for missing fields
      if (process.env.NODE_ENV === 'development') {
        console.warn('Environment validation warnings:', error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n'));
        // Return parsed result with defaults for missing fields
        return envSchema.safeParse(process.env).data || envSchema.parse({});
      }
      
      // In production, fail on any validation error
      throw new Error(
        `Environment validation failed:\n${error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n')}`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

export type { EnvSchema };
