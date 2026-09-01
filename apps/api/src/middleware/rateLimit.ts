import { FastifyInstance } from 'fastify';
import { env } from '@telegram-bot/config';
import { logger, ERROR_CODES } from '@telegram-bot/shared';
import Redis from 'ioredis';

let redisClient: Redis | null = null;

if (env.REDIS_URL) {
  redisClient = new Redis(env.REDIS_URL, {
    password: env.REDIS_TOKEN,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redisClient.on('error', (error) => {
    logger.error({ error }, 'Redis connection error');
  });
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: any) => string;
}

export async function setupRateLimit(fastify: FastifyInstance) {
  if (!redisClient) {
    logger.warn('Redis not configured, rate limiting disabled');
    return;
  }

  fastify.addHook('onRequest', async (request, reply) => {
    const key = generateRateLimitKey(request);
    const options = getRateLimitOptions(request);

    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(options.windowMs / 1000));
      }

      if (current > options.maxRequests) {
        const ttl = await redisClient.ttl(key);
        reply.header('X-RateLimit-Limit', options.maxRequests);
        reply.header('X-RateLimit-Remaining', 0);
        reply.header('X-RateLimit-Reset', ttl);

        reply.status(429).send({
          success: false,
          error: {
            code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
            message: 'Too many requests, please try again later',
          },
        });
        return reply;
      }

      reply.header('X-RateLimit-Limit', options.maxRequests);
      reply.header('X-RateLimit-Remaining', options.maxRequests - current);
    } catch (error) {
      logger.error({ error, key }, 'Rate limit check failed');
    }
  });
}

function generateRateLimitKey(request: any): string {
  const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
  const path = request.url;
  return `ratelimit:${ip}:${path}`;
}

function getRateLimitOptions(request: any): RateLimitOptions {
  const path = request.url;

  if (path.startsWith('/api/admin')) {
    return {
      windowMs: 60000,
      maxRequests: 30,
    };
  }

  if (path.startsWith('/telegram/webhook')) {
    return {
      windowMs: 60000,
      maxRequests: 100,
    };
  }

  return {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  };
}

export function getRedisClient(): Redis | null {
  return redisClient;
}
