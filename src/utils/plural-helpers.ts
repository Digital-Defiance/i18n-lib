/**
 * Helper functions for creating plural and gender strings
 */

import { GenderCategory, GenderedString } from '../gender/gender-categories';
import { getRequiredPluralForms as getRequiredFormsFromMap } from '../pluralization/language-plural-map';
import { PluralCategory } from '../pluralization/plural-categories';
import { PluralString } from '../types/plural-types';

/**
 * Creates a PluralString from a partial record of plural forms.
 * @param forms - Object mapping plural categories to their string forms
 * @returns A PluralString that can be used in translations
 */
export function createPluralString(
  forms: Partial<Record<PluralCategory, string>>,
): PluralString {
  return forms;
}

/**
 * Creates a GenderedString from a partial record of gender forms.
 * @param forms - Object mapping gender categories to their string forms
 * @returns A GenderedString that can be used in translations
 */
export function createGenderedString(
  forms: Partial<Record<GenderCategory, string>>,
): GenderedString {
  return forms;
}

/**
 * Gets the required plural forms for a given language.
 * Different languages have different plural rules and require different forms.
 * @param language - The language code
 * @returns Array of plural categories required for the language
 */
export function getRequiredPluralForms(language: string): PluralCategory[] {
  return getRequiredFormsFromMap(language) as PluralCategory[];
}
