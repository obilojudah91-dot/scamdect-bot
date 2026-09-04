import type { Telegraf } from "telegraf";
import type { ScamIntelligenceProvider } from "../../intelligence/ScamIntelligenceProvider.js";
import { logger } from "../../config/logger.js";

let cache: { data: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

async function renderStats(provider: ScamIntelligenceProvider): Promise<string> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;

  const stats = await provider.getStats();
  const text = [
    "*📊 ScamDect Stats*",
    "",
    `Total reports: ${stats.totalReports}`,
    `Total checks performed: ${stats.totalChecks}`,
    `High-risk detections: ${stats.highRiskDetections}`,
    `Verified reports: ${stats.verifiedReports}`,
  ].join("\n");

  cache = { data: text, expiresAt: Date.now() + CACHE_TTL_MS };
  return text;
}

export function registerStatsHandler(bot: Telegraf, provider: ScamIntelligenceProvider): void {
  bot.command("stats", async (ctx) => {
    try {
      await ctx.reply(await renderStats(provider), { parse_mode: "Markdown" });
    } catch (err) {
      logger.error({ err }, "Failed to render stats");
      throw err;
    }
  });

  bot.action("menu:stats", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(await renderStats(provider), { parse_mode: "Markdown" });
  });
}
