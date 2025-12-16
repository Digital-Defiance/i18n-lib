/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HTML escaping utilities for XSS prevention
 */

/**
 * Map of HTML characters to their escaped equivalents.
 */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Regular expression to match characters that need HTML escaping.
 */
const HTML_ESCAPE_REGEX = /[&<>"'/]/g;

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param str - The string to escape
 * @returns The escaped string
 */
export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPES[char]);
}

/**
 * Safely converts a value to a string, optionally escaping HTML.
 * Rejects objects to prevent toString exploits.
 * @param value - The value to stringify
 * @param options - Options including whether to escape HTML
 * @param options.escapeHtml - If true, HTML-escapes the result
 * @returns The stringified value
 * @throws {Error} If the value is an object (to prevent exploits)
 */
export function safeStringify(
  value: any,
  options?: { escapeHtml?: boolean },
): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return options?.escapeHtml ? escapeHtml(value) : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  // Reject objects to prevent toString exploits
  throw new Error('Invalid value type for stringification');
}
