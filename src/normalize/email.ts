export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function looksLikeEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
}
