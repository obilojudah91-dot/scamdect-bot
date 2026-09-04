import type { IdentifierType, RiskLevel, ScamCategory } from "@prisma/client";

export interface CheckResult {
  type: IdentifierType;
  normalizedValue: string;
  riskScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
}

export interface ReportSubmission {
  type: IdentifierType;
  normalizedValue: string;
  category: ScamCategory;
  description: string;
  platform?: string;
  amountInvolved?: number;
  reporterTelegramId: string;
}

export interface ReportResult {
  isDuplicate: boolean;
}

export interface Stats {
  totalReports: number;
  totalChecks: number;
  highRiskDetections: number;
  verifiedReports: number;
}

export interface ScamIntelligenceProvider {
  checkIdentifier(type: IdentifierType, normalizedValue: string, telegramUserId: string): Promise<CheckResult>;
  submitReport(submission: ReportSubmission): Promise<ReportResult>;
  getStats(): Promise<Stats>;
}
