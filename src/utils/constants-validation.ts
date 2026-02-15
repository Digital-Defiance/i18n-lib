/**
 * Runtime validation utilities for i18n constants.
 *
 * Ensures that all `{variable}` references in translation templates
 * have corresponding keys in the registered constants, and optionally
 * detects unused constants (registered but never referenced).
 */

import type { II18nConstants } from '../interfaces/i18n-constants.interface';

/**
 * Result of constants coverage validation.
 */
export interface ConstantsCoverageResult {
  /** Whether all template variables have matching constants */
  readonly isValid: boolean;
  /** Variable names referenced in templates but missing from constants */
  readonly missingConstants: readonly string[];
  /** Constant keys registered but never referenced in any template */
  readonly unusedConstants: readonly string[];
  /** All variable names found in templates */
  readonly referencedVariables: readonly string[];
}

/**
 * Extracts all `{variableName}` references from a string.
 */
function extractVariableReferences(str: string): string[] {
  const matches = str.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

/**
 * Validates that all `{variable}` references in translation strings
 * have corresponding keys in the provided constants.
 *
 * Use this in unit tests to catch drift between templates and constants:
 *
 * ```typescript
 * import { validateConstantsCoverage } from '@digitaldefiance/i18n-lib';
 *
 * it('should have constants for all template variables', () => {
 *   const result = validateConstantsCoverage(
 *     SuiteCoreComponentStrings,
 *     { Site: 'Test', SiteTagline: 'Tagline', ... },
 *   );
 *   expect(result.missingConstants).toEqual([]);
 * });
 * ```
 *
 * @param strings - Translation strings organized by language, then by key.
 *   Shape: `Record<language, Record<stringKey, string>>`
 * @param constants - The constants object to validate against.
 * @param options - Optional configuration.
 * @param options.ignoreVariables - Variable names to exclude from validation
 *   (e.g., runtime variables like `count` that aren't constants).
 * @returns Validation result with missing and unused constants.
 */
export function validateConstantsCoverage(
  strings: Record<string, Record<string, string>>,
  constants: II18nConstants,
  options?: { ignoreVariables?: readonly string[] },
): ConstantsCoverageResult {
  const ignoreSet = new Set(options?.ignoreVariables ?? []);
  const allVariables = new Set<string>();

  // Scan all translation strings across all languages
  for (const langStrings of Object.values(strings)) {
    for (const value of Object.values(langStrings)) {
      if (typeof value === 'string') {
        for (const varName of extractVariableReferences(value)) {
          if (!ignoreSet.has(varName)) {
            allVariables.add(varName);
          }
        }
      }
    }
  }

  const constantKeys = new Set(Object.keys(constants));
  const referencedVariables = Array.from(allVariables).sort();
  const missingConstants = referencedVariables.filter(
    (v) => !constantKeys.has(v),
  );
  const unusedConstants = Array.from(constantKeys)
    .filter((k) => !allVariables.has(k))
    .sort();

  return {
    isValid: missingConstants.length === 0,
    missingConstants,
    unusedConstants,
    referencedVariables,
  };
}
