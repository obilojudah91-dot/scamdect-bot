export function normalizeUsername(input: string): string {
  return input.trim().replace(/^@/, "").toLowerCase();
}

export function looksLikeUsername(input: string): boolean {
  // Match @username or just username (alphanumeric with optional underscores)
  const usernameRegex = /^@?[a-zA-Z0-9_]{3,32}$/;
  return usernameRegex.test(input.trim());
}
