import type { IdentifierType } from "@prisma/client";

export function normalizePhone(input: string): string {
  // Remove all non-numeric characters except + for international prefix
  const cleaned = input.replace(/[^\d+]/g, "");
  
  // If starts with +, keep it as international format
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  
  // Otherwise assume it needs a country code - for now return as-is
  // In production, you'd add country detection logic here
  return cleaned;
}

export function looksLikePhone(input: string): boolean {
  // Match phone patterns: with/without +, with/without spaces/dashes
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(input.trim());
}
