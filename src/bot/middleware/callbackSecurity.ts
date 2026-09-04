import type { Context, MiddlewareFn } from "telegraf";
import { logger } from "../../config/logger.js";

const ALLOWED_CALLBACK_PREFIXES = [
  "menu:check",
  "menu:report",
  "menu:stats",
  "menu:about",
  "report:category:",
  "report:submit",
  "report:cancel",
  "report:skip",
  "admin:",
];

export const callbackSecurityMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  if (ctx.updateType !== "callback_query") return next();

  const data = ctx.callbackQuery && "data" in ctx.callbackQuery ? ctx.callbackQuery.data : undefined;

  if (!data || typeof data !== "string" || data.length > 64) {
    logger.warn({ userId: ctx.from?.id }, "Rejected malformed callback_data");
    await ctx.answerCbQuery("Invalid action.", { show_alert: false });
    return;
  }

  const isAllowed = ALLOWED_CALLBACK_PREFIXES.some((prefix) => data.startsWith(prefix));
  if (!isAllowed) {
    logger.warn({ userId: ctx.from?.id, data }, "Rejected unrecognized callback_data");
    await ctx.answerCbQuery("Unknown action.", { show_alert: false });
    return;
  }

  return next();
};
