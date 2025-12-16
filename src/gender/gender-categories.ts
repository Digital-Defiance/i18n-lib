/**
 * Gender categories for gendered translations
 */

/**
 * Standard gender categories for translations that vary by gender.
 */
export type GenderCategory = 'male' | 'female' | 'neutral' | 'other';

/**
 * A string value that can be either a simple string or an object with gender-specific forms.
 */
export type GenderedString = string | Partial<Record<GenderCategory, string>>;

/**
 * Checks if a value is a gendered string object (not a simple string).
 * @param value - The value to check
 * @returns True if the value is a gendered string object, false otherwise
 */
export function isGenderedString(
  value: unknown,
): value is Partial<Record<GenderCategory, string>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
