/**
 * Type definitions for pluralization support
 */

import { PluralCategory } from '../pluralization/plural-categories';

/**
 * A string value that can be either a simple string or an object with plural forms
 */
export type PluralString = string | Partial<Record<PluralCategory, string>>;

/**
 * Check if a value is a plural string object (not a simple string)
 */
export function isPluralString(value: any): value is Record<PluralCategory, string> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Get the appropriate plural form from a PluralString
 */
export function resolvePluralString(
  value: PluralString,
  category: PluralCategory
): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  
  // Try exact match first
  if (value[category]) {
    return value[category];
  }
  
  // Fallback to 'other'
  if (value.other) {
    return value.other;
  }
  
  // Fallback to first available form
  const forms = Object.values(value);
  return forms.length > 0 ? forms[0] : undefined;
}
