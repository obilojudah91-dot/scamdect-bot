import { Markup } from "telegraf";
import type { ScamCategory } from "@prisma/client";

export const mainMenuKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🔍 Check Something", "menu:check")],
  [Markup.button.callback("🚨 Report a Scam", "menu:report")],
  [Markup.button.callback("📊 ScamDect Stats", "menu:stats")],
  [Markup.button.callback("ℹ️ About ScamDect", "menu:about")],
]);

export const postCheckKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🚨 Report Scam", "menu:report")],
  [Markup.button.callback("🔍 Check Another", "menu:check")],
]);

const CATEGORY_LABELS: Record<ScamCategory, string> = {
  INVESTMENT: "Investment",
  ROMANCE: "Romance",
  JOB_SCAM: "Job Scam",
  ONLINE_SHOPPING: "Online Shopping",
  PHISHING: "Phishing",
  IMPERSONATION: "Impersonation",
  CRYPTO: "Crypto",
  FAKE_GIVEAWAY: "Fake Giveaway",
  OTHER: "Other",
};

export const categoryKeyboard = Markup.inlineKeyboard(
  (Object.keys(CATEGORY_LABELS) as ScamCategory[]).map((cat) => [
    Markup.button.callback(CATEGORY_LABELS[cat], `report:category:${cat}`),
  ])
);

export const confirmReportKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("✅ Submit", "report:submit")],
  [Markup.button.callback("❌ Cancel", "report:cancel")],
]);

export const skipOptionalKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("⏭ Skip", "report:skip")],
]);

export { CATEGORY_LABELS };
