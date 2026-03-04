/**
 * Generate a URL-safe slug from a title string.
 * Lowercase, replace non-alphanumeric with hyphens, trim edges, max 100 chars.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100)
}
