/**
 * Gender form resolution
 */

import { GenderCategory, GenderedString, isGenderedString } from './gender-categories';

/**
 * Resolve gender form with fallback logic
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
