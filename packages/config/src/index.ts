import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN is required'),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1, 'TELEGRAM_WEBHOOK_SECRET is required'),
  
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),
  REDIS_TOKEN: z.string().optional(),
  
  ADMIN_TELEGRAM_IDS: z.string()
    .transform((val) => val.split(',').map((id) => BigInt(id.trim())))
    .pipe(z.array(z.bigint()).min(1, 'At least one admin ID is required')),
  
  API_URL: z.string().url('API_URL must be a valid URL').default('http://localhost:3000'),
  WEB_APP_URL: z.string().url('WEB_APP_URL must be a valid URL').optional(),
  
  // CORS configuration
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
  
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
      const missingVars = error.errors
        .filter((e) => e.code === 'invalid_type' && e.received === 'undefined')
        .map((e) => e.path.join('.'));
      
      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(', ')}\n` +
          'Please check your .env file or environment configuration.'
        );
      }
      
      throw new Error(
        `Environment validation failed:\n${error.errors.map((e) => `- ${e.path.join('.')}: ${e.message}`).join('\n')}`
      );
    }
    throw error;
  }
}

export const env = validateEnv();

export type { EnvSchema };
