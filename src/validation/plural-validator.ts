/**
 * Plural form validation
 */

import { PluralCategory } from '../pluralization/plural-categories';
import { PluralString, isPluralString } from '../types/plural-types';
import { getRequiredPluralForms, getAllPluralForms } from '../pluralization/language-plural-map';

export interface PluralValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PluralValidationOptions {
  strict?: boolean;
  checkUnused?: boolean;
  checkVariables?: boolean;
}

/**
 * Validate plural forms for a specific language
 */
export function validatePluralForms(
  value: PluralString,
  language: string,
  key: string,
  options: PluralValidationOptions = {}
): PluralValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isPluralString(value)) {
    return { isValid: true, errors, warnings };
  }

  const required = getRequiredPluralForms(language);
  const all = getAllPluralForms(language);
  const provided = Object.keys(value) as PluralCategory[];

  // Check required forms
  for (const form of required) {
    if (!value[form as PluralCategory]) {
      if (options.strict) {
        errors.push(`Missing required plural form '${form}' for language '${language}' in key '${key}'`);
      } else {
        warnings.push(`Missing required plural form '${form}' for language '${language}' in key '${key}'`);
      }
    }
  }

  // Check unused forms
  if (options.checkUnused) {
    for (const form of provided) {
      if (!all.includes(form)) {
        warnings.push(`Unused plural form '${form}' for language '${language}' in key '${key}'`);
      }
    }
  }

  // Check variable consistency
  if (options.checkVariables) {
    const variables = extractVariables(value);
    const inconsistent = findInconsistentVariables(value, variables);
    for (const [form, missing] of Object.entries(inconsistent)) {
      warnings.push(`Plural form '${form}' in key '${key}' missing variables: ${missing.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract all variables from plural forms
 */
function extractVariables(value: PluralString): Set<string> {
  const vars = new Set<string>();
  if (typeof value === 'string') return vars;

  for (const text of Object.values(value)) {
    if (text) {
      const matches = text.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach(m => vars.add(m.slice(1, -1)));
      }
    }
  }
  return vars;
}

/**
 * Find forms with inconsistent variables
 */
function findInconsistentVariables(
  value: PluralString,
  allVars: Set<string>
): Record<string, string[]> {
  const inconsistent: Record<string, string[]> = {};
  if (typeof value === 'string') return inconsistent;

  for (const [form, text] of Object.entries(value)) {
    if (text) {
      const formVars = new Set<string>();
      const matches = text.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach(m => formVars.add(m.slice(1, -1)));
      }

      const missing = Array.from(allVars).filter(v => !formVars.has(v));
      if (missing.length > 0) {
        inconsistent[form] = missing;
      }
    }
  }
  return inconsistent;
}

/**
 * Validate that count variable exists when plural forms are used
 */
export function validateCountVariable(
  value: PluralString,
  variables: Record<string, any> | undefined,
  key: string
): PluralValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isPluralString(value) && (!variables || variables.count === undefined)) {
    warnings.push(`Plural forms used in key '${key}' but no 'count' variable provided`);
  }

  return { isValid: true, errors, warnings };
}
