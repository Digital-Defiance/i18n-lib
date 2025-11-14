/**
 * HTML escaping utilities for XSS prevention
 */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const HTML_ESCAPE_REGEX = /[&<>"'/]/g;

export function escapeHtml(str: string): string {
  return str.replace(HTML_ESCAPE_REGEX, char => HTML_ESCAPES[char]);
}

export function safeStringify(value: any, options?: { escapeHtml?: boolean }): string {
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
