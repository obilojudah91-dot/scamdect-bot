import type { Telegraf, Context } from "telegraf";
import { classifyInput } from "../../normalize/classify.js";
import { RISK_LEVEL_LABEL } from "../../services/riskEngine.js";
import { postCheckKeyboard } from "../keyboards.js";
import { requireUserId } from "../session.js";
import type { ScamIntelligenceProvider } from "../../intelligence/ScamIntelligenceProvider.js";
import { logger } from "../../config/logger.js";

const TYPE_LABEL: Record<string, string> = {
  PHONE: "Phone Number",
  URL: "URL",
  EMAIL: "Email Address",
  USERNAME: "Username",
  CRYPTO_WALLET: "Crypto Wallet",
  PAYMENT_ID: "Payment Identifier",
  TEXT: "Text",
};

async function formatCheckResult(
  provider: ScamIntelligenceProvider,
  rawInput: string,
  telegramUserId: string
): Promise<string> {
  const classified = classifyInput(rawInput);

  if (!classified) {
    return "⚠️ I couldn't recognize that as something I can check. Try a phone number, URL, email, username, or wallet address.";
  }

  const result = await provider.checkIdentifier(classified.type, classified.normalizedValue, telegramUserId);

  return [
    RISK_LEVEL_LABEL[result.riskLevel],
    "",
    `*Type:* ${TYPE_LABEL[result.type] ?? result.type}`,
    `*Risk Score:* ${result.riskScore}/100`,
    "",
    "*Why:*",
    ...(result.reasons.length > 0 ? result.reasons.map((r) => `• ${r}`) : ["No known reports found for this identifier."]),
    "",
    "_ScamDect reports known indicators and evidence — this is a risk assessment, not proof of wrongdoing. Always verify independently before sending money or personal information._",
  ].join("\n");
}

export async function performCheck(ctx: Context, provider: ScamIntelligenceProvider, text: string): Promise<void> {
  const userId = requireUserId(ctx);
  if (!userId) return;

  await ctx.reply("🔎 Checking...");
  try {
    const response = await formatCheckResult(provider, text, userId);
    await ctx.reply(response, { parse_mode: "Markdown", ...postCheckKeyboard });
  } catch (err) {
    logger.error({ err, userId }, "Check failed");
    throw err;
  }
}

export function registerCheckHandler(bot: Telegraf, provider: ScamIntelligenceProvider): void {
  bot.command("check", async (ctx) => {
    const arg = ctx.message.text.replace(/^\/check\s*/i, "").trim();
    if (!arg) {
      await ctx.reply("Send me what you'd like to check — a phone number, URL, email, username, or wallet address.");
      return;
    }
    await performCheck(ctx, provider, arg);
  });

  bot.action("menu:check", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Send me what you'd like to check — a phone number, URL, email, username, or wallet address.");
  });
}
