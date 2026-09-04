import type { Telegraf } from "telegraf";

/**
 * /cancel's core logic lives in report.ts (it needs access to the session
 * store). This file exists only as the documented command entry point for
 * anyone reading the handlers/ directory — kept as a thin no-op registration
 * guard so a duplicate `bot.command("cancel", ...)` is never accidentally
 * added here (Telegraf would run both, confusing behavior).
 */
export function registerCancelHandler(_bot: Telegraf): void {
  // Intentionally empty — see report.ts's bot.command("cancel", ...).
}
