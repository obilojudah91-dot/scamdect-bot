export function normalizeUrl(input: string): string {
  let url = input.trim();
  
  // Add protocol if missing
  if (!url.match(/^https?:\/\//)) {
    url = "https://" + url;
  }
  
  try {
    const parsed = new URL(url);
    // Normalize: lowercase hostname, remove default ports, sort query params
    parsed.hostname = parsed.hostname.toLowerCase();
    if ((parsed.protocol === "https:" && parsed.port === "443") ||
        (parsed.protocol === "http:" && parsed.port === "80")) {
      parsed.port = "";
    }
    return parsed.toString();
  } catch {
    // If invalid URL, return as-is
    return input.trim();
  }
}

export function looksLikeUrl(input: string): boolean {
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  return urlRegex.test(input.trim());
}
