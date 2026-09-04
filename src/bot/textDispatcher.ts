import type { Telegraf } from "telegraf";
import { requireUserId, getReportDraft } from "./session.js";
import { handleReportTextStep } from "./handlers/report.js";
import { performCheck } from "./handlers/check.js";
import { checkRateLimit } from "./middleware/rateLimit.js";
import type { ScamIntelligenceProvider } from "../intelligence/ScamIntelligenceProvider.js";

export function registerTextDispatcher(bot: Telegraf, provider: ScamIntelligenceProvider): void {
  bot.on("text", async (ctx, next) => {
    if (ctx.message.text.startsWith("/")) return next();

    const userId = requireUserId(ctx);
    if (!userId) return;

    if (getReportDraft(userId)) {
      await handleReportTextStep(ctx as typeof ctx & { message: { text: string } }, userId);
      return;
    }

    return checkRateLimit(ctx, async () => {
      await performCheck(ctx, provider, ctx.message.text);
    });
  });
}
