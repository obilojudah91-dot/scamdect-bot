import { Middleware, Context } from 'telegraf';
import { env } from '@telegram-bot/config';
import { logger } from '@telegram-bot/shared';
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
    logger.error({ error }, 'Redis connection error in bot rate limiter');
  });
}

interface BotRateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

function getBotRateLimitOptions(): BotRateLimitOptions {
  // More lenient limits for normal bot commands
  return {
    windowMs: 60000, // 1 minute
    maxRequests: 30, // 30 commands per minute per user
  };
}

export function botRateLimitMiddleware(): Middleware<Context> {
  return async (ctx, next) => {
    if (!redisClient || !ctx.from) {
      // Fail open if Redis is unavailable or no user context
      return next();
    }

    const telegramId = ctx.from.id.toString();
    const options = getBotRateLimitOptions();
    const key = `bot:ratelimit:${telegramId}`;

    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, Math.ceil(options.windowMs / 1000));
      }

      if (current > options.maxRequests) {
        const ttl = await redisClient.ttl(key);
        logger.warn({ 
          telegramId, 
          current, 
          limit: options.maxRequests,
          ttl 
        }, 'Bot rate limit exceeded');

        if (ctx.chat) {
          await ctx.reply(
            `⚠️ You're sending messages too quickly. Please wait ${Math.ceil(ttl / 60)} minute(s) before trying again.`
          );
        }
        return;
      }
    } catch (error) {
      logger.error({ error, telegramId }, 'Bot rate limit check failed, allowing request');
      // Fail open on Redis errors
    }

    return next();
  };
}

export function getRedisClient(): Redis | null {
  return redisClient;
}
