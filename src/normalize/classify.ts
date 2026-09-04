import type { IdentifierType } from "@prisma/client";
import { looksLikePhone, normalizePhone } from "./phone.js";
import { looksLikeUrl, normalizeUrl } from "./url.js";
import { looksLikeEmail, normalizeEmail } from "./email.js";
import { looksLikeUsername, normalizeUsername } from "./username.js";

export interface ClassifiedInput {
  type: IdentifierType;
  normalizedValue: string;
}

export function classifyInput(input: string): ClassifiedInput | null {
  const trimmed = input.trim();
  
  if (looksLikePhone(trimmed)) {
    return { type: "PHONE", normalizedValue: normalizePhone(trimmed) };
  }
  
  if (looksLikeUrl(trimmed)) {
    return { type: "URL", normalizedValue: normalizeUrl(trimmed) };
  }
  
  if (looksLikeEmail(trimmed)) {
    return { type: "EMAIL", normalizedValue: normalizeEmail(trimmed) };
  }
  
  if (looksLikeUsername(trimmed)) {
    return { type: "USERNAME", normalizedValue: normalizeUsername(trimmed) };
  }
  
  // Crypto wallet addresses (basic pattern matching)
  if (/^(0x[a-fA-F0-9]{40}|[13][a-km-zA-Z1-9]{25,34}|bc1[a-zA-Z0-9]{11,71})$/.test(trimmed)) {
    return { type: "CRYPTO_WALLET", normalizedValue: trimmed.toLowerCase() };
  }
  
  // Payment IDs (generic pattern)
  if (/^[A-Z0-9]{8,32}$/.test(trimmed)) {
    return { type: "PAYMENT_ID", normalizedValue: trimmed };
  }
  
  // Fallback to TEXT if nothing matches
  return { type: "TEXT", normalizedValue: trimmed };
}
