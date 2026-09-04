import type { Telegraf, Context } from "telegraf";
import type { ScamCategory } from "@prisma/client";
import { classifyInput } from "../../normalize/classify.js";
import { categoryKeyboard, confirmReportKeyboard, skipOptionalKeyboard, CATEGORY_LABELS } from "../keyboards.js";
import { reportRateLimit } from "../middleware/rateLimit.js";
import {
  getReportDraft,
  startReportDraft,
  updateReportDraft,
  clearReportDraft,
  requireUserId,
  type ReportDraft,
} from "../session.js";
import type { ScamIntelligenceProvider } from "../../intelligence/ScamIntelligenceProvider.js";
import { logger } from "../../config/logger.js";

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_PLATFORM_LENGTH = 100;

function renderReview(draft: ReportDraft): string {
  return [
    "*Report Review*",
    "",
    `*Category:* ${draft.category ? CATEGORY_LABELS[draft.category] : "—"}`,
    `*Identifier:* ${draft.rawIdentifier ?? "—"}`,
    `*Platform:* ${draft.platform ?? "Not specified"}`,
    `*Amount involved:* ${draft.amountInvolved != null ? draft.amountInvolved : "Not specified"}`,
    `*Description:*\n${draft.description ?? "—"}`,
    "",
    "Submit this report?",
  ].join("\n");
}

async function beginReport(ctx: Context): Promise<void> {
  const userId = requireUserId(ctx);
  if (!userId) return;
  startReportDraft(userId);
  await ctx.reply("What type of scam are you reporting?", categoryKeyboard);
}

export function registerReportHandler(bot: Telegraf, provider: ScamIntelligenceProvider): void {
  bot.command("report", reportRateLimit, beginReport);
  bot.action("menu:report", reportRateLimit, async (ctx) => {
    await ctx.answerCbQuery();
    await beginReport(ctx);
  });

  bot.action(/^report:category:(.+)$/, async (ctx) => {
    const userId = requireUserId(ctx);
    if (!userId) return;
    await ctx.answerCbQuery();

    const category = ctx.match[1] as ScamCategory;
    if (!Object.keys(CATEGORY_LABELS).includes(category)) {
      await ctx.reply("⚠️ Unrecognized category — please start again with /report.");
      clearReportDraft(userId);
      return;
    }

    const draft = getReportDraft(userId);
    if (!draft) {
      await ctx.reply("This report session expired. Please start again with /report.");
      return;
    }

    updateReportDraft(userId, { category, step: "AWAITING_IDENTIFIER" });
    await ctx.reply("What's the suspicious phone number, URL, email, username, or wallet address?");
  });

  bot.action("report:skip", async (ctx) => {
    const userId = requireUserId(ctx);
    if (!userId) return;
    await ctx.answerCbQuery();

    const draft = getReportDraft(userId);
    if (!draft) {
      await ctx.reply("This report session expired. Please start again with /report.");
      return;
    }

    if (draft.step === "AWAITING_PLATFORM") {
      updateReportDraft(userId, { step: "AWAITING_AMOUNT" });
      await ctx.reply("Was a specific amount of money involved? Send the amount, or Skip.", skipOptionalKeyboard);
    } else if (draft.step === "AWAITING_AMOUNT") {
      const updated = updateReportDraft(userId, { step: "AWAITING_CONFIRMATION" });
      if (updated) await ctx.reply(renderReview(updated), { parse_mode: "Markdown", ...confirmReportKeyboard });
    }
  });

  bot.action("report:cancel", async (ctx) => {
    const userId = requireUserId(ctx);
    if (!userId) return;
    await ctx.answerCbQuery();
    clearReportDraft(userId);
    await ctx.reply("❌ Report cancelled.");
  });

  bot.action("report:submit", async (ctx) => {
    const userId = requireUserId(ctx);
    if (!userId) return;
    await ctx.answerCbQuery();

    const draft = getReportDraft(userId);
    if (!draft || !draft.category || !draft.rawIdentifier || !draft.description) {
      await ctx.reply("⚠️ This report session is incomplete or expired. Please start again with /report.");
      clearReportDraft(userId);
      return;
    }

    const classified = classifyInput(draft.rawIdentifier);
    if (!classified) {
      await ctx.reply("⚠️ I couldn't process that identifier. Please start again with /report.");
      clearReportDraft(userId);
      return;
    }

    try {
      const result = await provider.submitReport({
        type: classified.type,
        normalizedValue: classified.normalizedValue,
        category: draft.category,
        description: draft.description,
        platform: draft.platform,
        amountInvolved: draft.amountInvolved,
        reporterTelegramId: userId,
      });

      clearReportDraft(userId);

      if (result.isDuplicate) {
        await ctx.reply(
          "This looks like a report we already have on file for this identifier within the last few days — thank you, but no new entry was created to avoid duplicates."
        );
      } else {
        await ctx.reply("✅ Thank you — your report has been submitted and will help protect others.");
      }
    } catch (err) {
      logger.error({ err, userId }, "Report submission failed");
      throw err;
    }
  });

  bot.command("cancel", async (ctx) => {
    const userId = requireUserId(ctx);
    if (!userId) return;
    if (getReportDraft(userId)) {
      clearReportDraft(userId);
      await ctx.reply("❌ Cancelled your in-progress report.");
    } else {
      await ctx.reply("Nothing to cancel.");
    }
  });
}

export async function handleReportTextStep(
  ctx: Context & { message: { text: string } },
  userId: string
): Promise<boolean> {
  const draft = getReportDraft(userId);
  if (!draft) return false;

  const text = ctx.message.text.trim();

  switch (draft.step) {
    case "AWAITING_IDENTIFIER": {
      if (!text || text.length > 500) {
        await ctx.reply("Please send a valid identifier (under 500 characters).");
        return true;
      }
      updateReportDraft(userId, { rawIdentifier: text, step: "AWAITING_DESCRIPTION" });
      await ctx.reply("Please describe what happened.");
      return true;
    }
    case "AWAITING_DESCRIPTION": {
      if (!text) {
        await ctx.reply("Please describe what happened — this field can't be empty.");
        return true;
      }
      const trimmed = text.slice(0, MAX_DESCRIPTION_LENGTH);
      updateReportDraft(userId, { description: trimmed, step: "AWAITING_PLATFORM" });
      await ctx.reply("Which platform did this happen on? (e.g. Telegram, WhatsApp, Instagram) Or tap Skip.", skipOptionalKeyboard);
      return true;
    }
    case "AWAITING_PLATFORM": {
      const trimmed = text.slice(0, MAX_PLATFORM_LENGTH);
      updateReportDraft(userId, { platform: trimmed, step: "AWAITING_AMOUNT" });
      await ctx.reply("Was a specific amount of money involved? Send the amount, or tap Skip.", skipOptionalKeyboard);
      return true;
    }
    case "AWAITING_AMOUNT": {
      const parsed = Number(text.replace(/[^0-9.]/g, ""));
      const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
      const draftUpdate: Partial<ReportDraft> = { step: "AWAITING_CONFIRMATION" };
      if (amount !== undefined) draftUpdate.amountInvolved = amount;
      const updated = updateReportDraft(userId, draftUpdate);
      if (updated) await ctx.reply(renderReview(updated), { parse_mode: "Markdown", ...confirmReportKeyboard });
      return true;
    }
    default:
      await ctx.reply("Please use the buttons above to continue, or /cancel to stop.");
      return true;
  }
}
