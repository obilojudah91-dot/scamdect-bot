import type { Telegraf } from "telegraf";

const HELP_TEXT = `*ScamDect Bot — Help*

*/check* — Send a phone number, URL, email, username, or wallet address to check it, or just send it directly without the command.
*/report* — Report a scam to help protect the community.
*/stats* — View ScamDect's overall statistics.
*/about* — Learn about ScamDect.
*/cancel* — Cancel whatever you're currently doing (e.g. an in-progress report).

ScamDect shows *risk levels based on reports*, not confirmed accusations. Always use your own judgment and verify independently before sending money or personal information.`;

export function registerHelpHandler(bot: Telegraf): void {
  bot.help(async (ctx) => {
    await ctx.reply(HELP_TEXT, { parse_mode: "Markdown" });
  });
}
