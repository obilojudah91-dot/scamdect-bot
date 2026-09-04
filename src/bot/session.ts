import type { Context } from "telegraf";
import type { ScamCategory } from "@prisma/client";

export type ReportStep =
  | "AWAITING_CATEGORY"
  | "AWAITING_IDENTIFIER"
  | "AWAITING_DESCRIPTION"
  | "AWAITING_PLATFORM"
  | "AWAITING_AMOUNT"
  | "AWAITING_CONFIRMATION";

export interface ReportDraft {
  step: ReportStep;
  category?: ScamCategory;
  rawIdentifier?: string;
  description?: string;
  platform?: string;
  amountInvolved?: number;
  startedAt: number;
}

interface SessionStore {
  get(userId: string): ReportDraft | undefined;
  set(userId: string, draft: ReportDraft): void;
  clear(userId: string): void;
}

const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

class InMemorySessionStore implements SessionStore {
  private store = new Map<string, ReportDraft>();

  get(userId: string): ReportDraft | undefined {
    const draft = this.store.get(userId);
    if (!draft) return undefined;
    if (Date.now() - draft.startedAt > SESSION_TTL_MS) {
      this.store.delete(userId);
      return undefined;
    }
    return draft;
  }

  set(userId: string, draft: ReportDraft): void {
    this.store.set(userId, draft);
  }

  clear(userId: string): void {
    this.store.delete(userId);
  }
}

const sessionStore: SessionStore = new InMemorySessionStore();

export function getReportDraft(userId: string): ReportDraft | undefined {
  return sessionStore.get(userId);
}

export function startReportDraft(userId: string): ReportDraft {
  const draft: ReportDraft = { step: "AWAITING_CATEGORY", startedAt: Date.now() };
  sessionStore.set(userId, draft);
  return draft;
}

export function updateReportDraft(userId: string, patch: Partial<ReportDraft>): ReportDraft | undefined {
  const existing = sessionStore.get(userId);
  if (!existing) return undefined;
  const updated = { ...existing, ...patch };
  sessionStore.set(userId, updated);
  return updated;
}

export function clearReportDraft(userId: string): void {
  sessionStore.clear(userId);
}

export function requireUserId(ctx: Context): string | null {
  const id = ctx.from?.id;
  return id ? String(id) : null;
}
