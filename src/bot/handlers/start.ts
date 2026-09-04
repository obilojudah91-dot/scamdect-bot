import type { Telegraf } from "telegraf";
import { mainMenuKeyboard } from "../keyboards.js";

const WELCOME_TEXT = `👋 *Welcome to ScamDect*

ScamDect helps you check phone numbers, links, emails, usernames, and wallet addresses for known scam reports before you trust them.

Here's what I can do:
🔍 *Check* something suspicious — just send it to me directly, or use the button below
🚨 *Report* a scam to help protect others
📊 See ScamDect *statistics*

Pick an option below to get started.`;

export function registerStartHandler(bot: Telegraf): void {
  bot.start(async (ctx) => {
    await ctx.reply(WELCOME_TEXT, { parse_mode: "Markdown", ...mainMenuKeyboard });
  });
}
