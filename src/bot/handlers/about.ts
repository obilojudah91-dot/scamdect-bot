import type { Telegraf } from "telegraf";

const ABOUT_TEXT = `*About ScamDect*

ScamDect helps people check phone numbers, links, emails, usernames, and wallet addresses against community-reported scam activity before they trust them — and lets anyone report a scam to help protect others.

Risk levels reflect *reported evidence*, not confirmed legal findings. Always exercise your own judgment.`;

export function registerAboutHandler(bot: Telegraf): void {
  bot.command("about", async (ctx) => {
    await ctx.reply(ABOUT_TEXT, { parse_mode: "Markdown" });
  });

  bot.action("menu:about", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(ABOUT_TEXT, { parse_mode: "Markdown" });
  });
}
