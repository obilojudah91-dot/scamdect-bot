import { prisma } from "../../db/client.js";
import { logger } from "../../config/logger.js";
import type { IdentifierType, RiskLevel, ScamCategory } from "@prisma/client";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import type {
  ScamIntelligenceProvider,
  CheckResult,
  ReportSubmission,
  ReportResult,
  Stats,
} from "../ScamIntelligenceProvider.js";

export class LocalDbProvider implements ScamIntelligenceProvider {
  async checkIdentifier(
    type: IdentifierType,
    normalizedValue: string,
    telegramUserId: string
  ): Promise<CheckResult> {
    // Find or create the identifier first. CheckAudit.identifierId stores the
    // database id, not the normalized value.
    const identifier = await prisma.identifier.upsert({
      where: { normalizedValue },
      update: { checkCount: { increment: 1 } },
      create: {
        type,
        normalizedValue,
        rawValueSample: normalizedValue,
        riskScore: 0,
        riskLevel: "UNKNOWN",
        checkCount: 1,
      },
    });

    await prisma.checkAudit.create({
      data: {
        identifierId: identifier.id,
        requestedType: type,
        telegramUserId,
      },
    });

    const reports = await prisma.scamReport.findMany({
      where: {
        identifierId: identifier.id,
        status: { in: ["PENDING", "VERIFIED"] },
      },
    });

    const riskScore = this.calculateRiskScore(reports);
    const riskLevel = this.mapScoreToLevel(riskScore);
    const reasons = this.generateReasons(reports, riskLevel);

    await prisma.identifier.update({
      where: { id: identifier.id },
      data: { riskScore, riskLevel },
    });

    return {
      type: identifier.type,
      normalizedValue: identifier.normalizedValue,
      riskScore,
      riskLevel,
      reasons,
    };
  }

  async submitReport(submission: ReportSubmission): Promise<ReportResult> {
    const identifier = await prisma.identifier.upsert({
      where: { normalizedValue: submission.normalizedValue },
      update: { type: submission.type },
      create: {
        type: submission.type,
        normalizedValue: submission.normalizedValue,
        rawValueSample: submission.normalizedValue,
        riskScore: 0,
        riskLevel: "UNKNOWN",
        checkCount: 0,
      },
    });

    const contentHash = crypto
      .createHash("sha256")
      .update(
        `${submission.normalizedValue}|${submission.category}|${submission.description}`
      )
      .digest("hex");

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await prisma.scamReport.findFirst({
      where: {
        identifierId: identifier.id,
        category: submission.category,
        contentHash,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    if (existing) {
      logger.info({ identifierId: identifier.id }, "Duplicate report detected");
      return { isDuplicate: true };
    }

    await prisma.scamReport.create({
      data: {
        identifierId: identifier.id,
        category: submission.category,
        description: submission.description,
        platform: submission.platform ?? null,
        amountInvolved:
          submission.amountInvolved !== undefined
            ? new Prisma.Decimal(submission.amountInvolved)
            : null,
        reporterTelegramId: submission.reporterTelegramId,
        contentHash,
        status: "PENDING",
      },
    });

    logger.info({ identifierId: identifier.id }, "New report submitted");
    return { isDuplicate: false };
  }

  async getStats(): Promise<Stats> {
    const [totalReports, totalChecks, highRiskDetections, verifiedReports] =
      await Promise.all([
        prisma.scamReport.count(),
        prisma.checkAudit.count(),
        prisma.identifier.count({ where: { riskLevel: { in: ["HIGH", "CRITICAL"] } } }),
        prisma.scamReport.count({ where: { status: "VERIFIED" } }),
      ]);

    return {
      totalReports,
      totalChecks,
      highRiskDetections,
      verifiedReports,
    };
  }

  private calculateRiskScore(reports: Prisma.ScamReportGetPayload<object>[]): number {
    if (reports.length === 0) return 0;

    let score = 0;
    const categoryWeights: Record<ScamCategory, number> = {
      INVESTMENT: 15,
      CRYPTO: 15,
      PHISHING: 12,
      IMPERSONATION: 10,
      ROMANCE: 10,
      JOB_SCAM: 8,
      ONLINE_SHOPPING: 5,
      FAKE_GIVEAWAY: 8,
      OTHER: 3,
    };

    for (const report of reports) {
      score += 10;

      if (report.status === "VERIFIED") score += 20;
      score += categoryWeights[report.category] ?? 5;

      if (report.amountInvolved) {
        const amount = Number(report.amountInvolved);
        if (amount > 1000) score += 15;
        else if (amount > 100) score += 10;
        else if (amount > 10) score += 5;
      }
    }

    return Math.min(score, 100);
  }

  private mapScoreToLevel(score: number): RiskLevel {
    if (score >= 80) return "CRITICAL";
    if (score >= 60) return "HIGH";
    if (score >= 40) return "SUSPICIOUS";
    if (score >= 20) return "MODERATE";
    if (score >= 1) return "LOW";
    return "UNKNOWN";
  }

  private generateReasons(
    reports: Prisma.ScamReportGetPayload<object>[],
    riskLevel: RiskLevel
  ): string[] {
    if (reports.length === 0) return [];

    const reasons: string[] = [`${reports.length} report(s) found for this identifier`];
    const verifiedCount = reports.filter((r) => r.status === "VERIFIED").length;

    if (verifiedCount > 0) reasons.push(`${verifiedCount} verified report(s)`);

    const categories = new Set(reports.map((r) => r.category));
    if (categories.size > 0) {
      reasons.push(`Reported for: ${Array.from(categories).join(", ")}`);
    }

    if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
      reasons.push("Multiple reports indicate high risk");
    }

    return reasons;
  }
}
