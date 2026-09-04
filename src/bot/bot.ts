import { Telegraf } from "telegraf";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { callbackSecurityMiddleware } from "./middleware/callbackSecurity.js";
import { registerStartHandler } from "./handlers/start.js";
import { registerHelpHandler } from "./handlers/help.js";
import { registerCheckHandler } from "./handlers/check.js";
import { registerReportHandler } from "./handlers/report.js";
import { registerStatsHandler } from "./handlers/stats.js";
import { registerAboutHandler } from "./handlers/about.js";
import { registerAdminHandler } from "./handlers/admin.js";
import { registerTextDispatcher } from "./textDispatcher.js";
import type { ScamIntelligenceProvider } from "../intelligence/ScamIntelligenceProvider.js";

export function createBot(provider: ScamIntelligenceProvider): Telegraf {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.use(errorHandlerMiddleware);
  bot.use(callbackSecurityMiddleware);

  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerCheckHandler(bot, provider);
  registerReportHandler(bot, provider);
  registerStatsHandler(bot, provider);
  registerAboutHandler(bot);
  registerAdminHandler(bot, provider);

  registerTextDispatcher(bot, provider);

  bot.catch((err, ctx) => {
    logger.error({ err, updateType: ctx.updateType }, "Telegraf top-level error");
  });

  return bot;
}
