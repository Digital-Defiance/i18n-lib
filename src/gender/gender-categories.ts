/**
 * Gender categories for gendered translations
 */

export type GenderCategory = 'male' | 'female' | 'neutral' | 'other';

export type GenderedString = string | Partial<Record<GenderCategory, string>>;

export function isGenderedString(value: any): value is Partial<Record<GenderCategory, string>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
