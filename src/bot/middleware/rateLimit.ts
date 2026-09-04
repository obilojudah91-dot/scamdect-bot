import type { Context, MiddlewareFn } from "telegraf";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";

interface RateLimitStore {
  incrementAndCheck(key: string, windowSeconds: number, maxHits: number): Promise<boolean>;
}

class InMemoryRateLimitStore implements RateLimitStore {
  private hits = new Map<string, number[]>();

  async incrementAndCheck(key: string, windowSeconds: number, maxHits: number): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);
    if (timestamps.length >= maxHits) {
      this.hits.set(key, timestamps);
      return false;
    }
    timestamps.push(now);
    this.hits.set(key, timestamps);
    return true;
  }
}

const rateLimitStore: RateLimitStore = new InMemoryRateLimitStore();

if (!env.REDIS_URL && env.NODE_ENV === "production") {
  logger.warn(
    "REDIS_URL not set in production — rate limiting is per-instance only. " +
      "This is a known limitation if you scale beyond one instance."
  );
}

export function rateLimit(windowSeconds: number, maxHits: number, keyPrefix: string): MiddlewareFn<Context> {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    const key = `${keyPrefix}:${userId}`;
    const allowed = await rateLimitStore.incrementAndCheck(key, windowSeconds, maxHits);

    if (!allowed) {
      logger.info({ userId, key }, "Rate limit exceeded");
      if (ctx.callbackQuery) {
        await ctx.answerCbQuery("Slow down — you're doing that too often.", { show_alert: true });
      } else {
        await ctx.reply("⚠️ You're sending requests too quickly. Please wait a moment and try again.");
      }
      return;
    }

    return next();
  };
}

export const checkRateLimit = rateLimit(60, 10, "check");
export const reportRateLimit = rateLimit(3600, 5, "report");
