/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

/**
 * Plural form validation
 */

import {
  getAllPluralForms,
  getRequiredPluralForms,
} from '../pluralization/language-plural-map';
import { PluralCategory } from '../pluralization/plural-categories';
import { PluralString, isPluralString } from '../types/plural-types';

/**
 * Result of validating plural forms.
 */
export interface PluralValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
}

/**
 * Options for plural form validation.
 */
export interface PluralValidationOptions {
  /** If true, treat missing required forms as errors instead of warnings */
  strict?: boolean;
  /** If true, warn about unused plural forms */
  checkUnused?: boolean;
  /** If true, check for consistent variable usage across forms */
  checkVariables?: boolean;
}

/**
 * Validate plural forms for a specific language.
 * Checks that all required plural forms are present and optionally validates variable consistency.
 * @param value - The plural string value to validate
 * @param language - The language code
 * @param key - The translation key (for error messages)
 * @param options - Validation options
 * @returns Validation result with errors and warnings
 */
export function validatePluralForms(
  value: PluralString,
  language: string,
  key: string,
  options: PluralValidationOptions = {},
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
        errors.push(
          `Missing required plural form '${form}' for language '${language}' in key '${key}'`,
        );
      } else {
        warnings.push(
          `Missing required plural form '${form}' for language '${language}' in key '${key}'`,
        );
      }
    }
  }

  // Check unused forms
  if (options.checkUnused) {
    for (const form of provided) {
      if (!all.includes(form)) {
        warnings.push(
          `Unused plural form '${form}' for language '${language}' in key '${key}'`,
        );
      }
    }
  }

  // Check variable consistency
  if (options.checkVariables) {
    const variables = extractVariables(value);
    const inconsistent = findInconsistentVariables(value, variables);
    for (const [form, missing] of Object.entries(inconsistent)) {
      warnings.push(
        `Plural form '${form}' in key '${key}' missing variables: ${missing.join(
          ', ',
        )}`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract all variables from plural forms.
 * Scans all plural form texts for {variable} patterns.
 * @param value - The plural string value
 * @returns Set of all variable names found
 */
function extractVariables(value: PluralString): Set<string> {
  const vars = new Set<string>();
  if (typeof value === 'string') return vars;

  for (const text of Object.values(value)) {
    if (text) {
      const matches = text.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach((m) => vars.add(m.slice(1, -1)));
      }
    }
  }
  return vars;
}

/**
 * Find forms with inconsistent variables.
 * Identifies plural forms that are missing variables used in other forms.
 * @param value - The plural string value
 * @param allVars - Set of all variables found across all forms
 * @returns Object mapping form names to arrays of missing variable names
 */
function findInconsistentVariables(
  value: PluralString,
  allVars: Set<string>,
): Record<string, string[]> {
  const inconsistent: Record<string, string[]> = {};
  if (typeof value === 'string') return inconsistent;

  for (const [form, text] of Object.entries(value)) {
    if (text) {
      const formVars = new Set<string>();
      const matches = text.match(/\{(\w+)\}/g);
      if (matches) {
        matches.forEach((m) => formVars.add(m.slice(1, -1)));
      }

      const missing = Array.from(allVars).filter((v) => !formVars.has(v));
      if (missing.length > 0) {
        inconsistent[form] = missing;
      }
    }
  }
  return inconsistent;
}

/**
 * Validate that count variable exists when plural forms are used.
 * Pluralization requires a 'count' variable to determine which form to use.
 * @param value - The plural string value
 * @param variables - The variables object to check
 * @param key - The translation key (for error messages)
 * @returns Validation result with warnings if count is missing
 */
export function validateCountVariable(
  value: PluralString,
  variables: Record<string, any> | undefined,
  key: string,
): PluralValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isPluralString(value) && (!variables || variables.count === undefined)) {
    warnings.push(
      `Plural forms used in key '${key}' but no 'count' variable provided`,
    );
  }

  return { isValid: true, errors, warnings };
}
