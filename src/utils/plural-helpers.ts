/**
 * Helper functions for creating plural and gender strings
 */

import { PluralCategory } from '../pluralization/plural-categories';
import { PluralString } from '../types/plural-types';
import { GenderCategory, GenderedString } from '../gender/gender-categories';
import { getRequiredPluralForms as getRequiredFormsFromMap } from '../pluralization/language-plural-map';

export function createPluralString(forms: Partial<Record<PluralCategory, string>>): PluralString {
  return forms;
}

export function createGenderedString(forms: Partial<Record<GenderCategory, string>>): GenderedString {
  return forms;
}

export function getRequiredPluralForms(language: string): PluralCategory[] {
  return getRequiredFormsFromMap(language) as PluralCategory[];
}
