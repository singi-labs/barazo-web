import { sanitize } from 'isomorphic-dompurify'

/**
 * Formats a bio string: escapes HTML, autolinks URLs, converts newlines to <br>,
 * then sanitizes with DOMPurify (only <a> and <br> allowed).
 */
export function formatBio(bio: string): string {
  if (!bio) return ''

  // Step 1: Escape HTML entities
  let result = bio
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  // Step 2: Autolink URLs (only http:// and https://)
  // Display text strips protocol prefix and trailing slash for cleaner appearance.
  result = result.replace(/https?:\/\/[^\s<]+/g, (url) => {
    const display = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    return `<a href="${url}" rel="noopener noreferrer">${display}</a>`
  })

  // Step 3: Convert newlines to <br>
  result = result.replace(/\n/g, '<br>')

  // Step 4: Sanitize (only allow <a> and <br>)
  return sanitize(result, {
    ALLOWED_TAGS: ['a', 'br'],
    ALLOWED_ATTR: ['href', 'rel'],
  })
}
