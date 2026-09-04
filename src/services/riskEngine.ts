import type { RiskLevel } from "@prisma/client";

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  LOW: "✅ Low Risk",
  MODERATE: "⚠️ Moderate Risk",
  SUSPICIOUS: "🔶 Suspicious",
  HIGH: "🔴 High Risk",
  CRITICAL: "🚨 Critical Risk",
  UNKNOWN: "❓ Unknown Risk",
};
