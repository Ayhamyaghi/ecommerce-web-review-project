/**
 * Strips HTML tags (including script/style content) and trims whitespace.
 * Does NOT use DOMParser (not available in all environments) — uses regex.
 * Script and style tag contents are removed entirely to prevent XSS injection.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Removes characters that are not alphanumeric, spaces, or common punctuation.
 * Suitable for names and titles.
 */
export function sanitizeName(input: string): string {
  return stripHtml(input)
    .replace(/[^\w\s\-'.]/g, '')
    .substring(0, 200);
}

/**
 * Normalises an email address: lowercase, trimmed.
 */
export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase().substring(0, 254);
}

/**
 * Sanitises free-form text (reviews, comments).
 * Strips HTML and limits length.
 */
export function sanitizeText(input: string, maxLength = 2000): string {
  return stripHtml(input).substring(0, maxLength);
}

/**
 * Sanitises a promo code: uppercase, alphanumeric only.
 */
export function sanitizePromoCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 20);
}

/**
 * Sanitises a phone number: digits, spaces, +, -, (, ) only.
 */
export function sanitizePhone(input: string): string {
  return input
    .trim()
    .replace(/[^\d\s+\-().]/g, '')
    .substring(0, 20);
}

/**
 * Sanitises a postal/zip code: alphanumeric and hyphens only.
 */
export function sanitizePostalCode(input: string): string {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\- ]/g, '')
    .substring(0, 10);
}
