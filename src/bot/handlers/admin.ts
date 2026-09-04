import type { Telegraf } from "telegraf";
import { env } from "../../config/env.js";
import { prisma } from "../../db/client.js";
import { logger } from "../../config/logger.js";
import type { ScamIntelligenceProvider } from "../../intelligence/ScamIntelligenceProvider.js";

function isAdmin(telegramUserId: string | undefined): boolean {
  if (!telegramUserId) return false;
  return env.TELEGRAM_ADMIN_IDS.includes(telegramUserId);
}

async function requireAdmin(ctx: { from?: { id: number }; reply: (t: string) => Promise<unknown> }): Promise<boolean> {
  const userId = ctx.from ? String(ctx.from.id) : undefined;
  if (!isAdmin(userId)) {
    logger.warn({ userId }, "Unauthorized admin command attempt");
    await ctx.reply("⛔ This command is restricted.");
    return false;
  }
  return true;
}

export function registerAdminHandler(bot: Telegraf, _provider: ScamIntelligenceProvider): void {
  bot.command("admin", async (ctx) => {
    if (!(await requireAdmin(ctx))) return;
    await ctx.reply(
      "*Admin Menu*\n\n/admin_reports — view pending reports\n/admin_stats — system statistics",
      { parse_mode: "Markdown" }
    );
  });

  bot.command("admin_reports", async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const pending = await prisma.scamReport.findMany({
      where: { status: "PENDING" },
      take: 10,
      orderBy: { createdAt: "asc" },
      include: { identifier: true },
    });

    if (pending.length === 0) {
      await ctx.reply("No pending reports.");
      return;
    }

    const lines = pending.map(
      (r) =>
        `#${r.id.slice(-6)} | ${r.category} | ${r.identifier.normalizedValue} | ${r.createdAt.toISOString().slice(0, 10)}`
    );
    await ctx.reply(`*Pending Reports (${pending.length})*\n\n${lines.join("\n")}`, { parse_mode: "Markdown" });
  });

  bot.command("admin_stats", async (ctx) => {
    if (!(await requireAdmin(ctx))) return;

    const [pending, verified, rejected, totalIdentifiers] = await Promise.all([
      prisma.scamReport.count({ where: { status: "PENDING" } }),
      prisma.scamReport.count({ where: { status: "VERIFIED" } }),
      prisma.scamReport.count({ where: { status: "REJECTED" } }),
      prisma.identifier.count(),
    ]);

    await ctx.reply(
      `*Admin Stats*\n\nPending: ${pending}\nVerified: ${verified}\nRejected: ${rejected}\nTotal identifiers tracked: ${totalIdentifiers}`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("approve", async (ctx) => {
    if (!(await requireAdmin(ctx))) return;
    const id = ctx.message.text.split(" ")[1]?.trim();
    if (!id) {
      await ctx.reply("Usage: /approve <report_id>");
      return;
    }
    const adminId = String(ctx.from!.id);
    await prisma.$transaction([
      prisma.scamReport.update({ where: { id }, data: { status: "VERIFIED", reviewedAt: new Date(), reviewedBy: adminId } }),
      prisma.adminAction.create({ data: { adminId, action: "APPROVE_REPORT", targetType: "ScamReport", targetId: id } }),
    ]);
    await ctx.reply(`✅ Report ${id} marked as verified.`);
  });

  bot.command("reject", async (ctx) => {
    if (!(await requireAdmin(ctx))) return;
    const id = ctx.message.text.split(" ")[1]?.trim();
    if (!id) {
      await ctx.reply("Usage: /reject <report_id>");
      return;
    }
    const adminId = String(ctx.from!.id);
    await prisma.$transaction([
      prisma.scamReport.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date(), reviewedBy: adminId } }),
      prisma.adminAction.create({ data: { adminId, action: "REJECT_REPORT", targetType: "ScamReport", targetId: id } }),
    ]);
    await ctx.reply(`❌ Report ${id} rejected.`);
  });
}
