/**
 * Gender form resolution
 */

import { GenderCategory, GenderedString, isGenderedString } from './gender-categories';

/**
 * Resolve a gender-specific form with fallback logic.
 * If the value is a simple string, it's returned as-is.
 * For gendered strings, it tries the requested gender, then neutral, then other, then the first available form.
 * @param value - The gendered string value or simple string
 * @param gender - The gender category to resolve (optional)
 * @returns The resolved string form
 */
export function resolveGenderForm(
  value: GenderedString,
  gender: GenderCategory | string | undefined
): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!isGenderedString(value)) {
    return '';
  }

  // No gender provided - use neutral or other or first available
  if (!gender) {
    return value.neutral || value.other || Object.values(value)[0] || '';
  }

  // Try requested gender
  const requested = value[gender as GenderCategory];
  if (requested) {
    return requested;
  }

  // Fallback: neutral → other → first available
  return value.neutral || value.other || Object.values(value)[0] || '';
}
