/**
 * Branded interface definition for TranslationOptions.
 *
 * Provides runtime validation for translation option objects, catching
 * invalid variable types or malformed language codes before they reach
 * the translation pipeline.
 *
 * @module branded-translation-options
 */

import {
  createBrandedInterface,
  safeParseInterface,
} from '@digitaldefiance/branded-interface';
import type {
  BrandedInstance,
  InterfaceSafeParseResult,
} from '@digitaldefiance/branded-interface';

/**
 * Branded interface definition for TranslationOptions with field-level validation.
 *
 * - `variables`: optional plain object with string keys and string/number values
 * - `language`: optional non-empty string
 * - `fallback`: optional string
 */
export const BrandedTranslationOptions = createBrandedInterface<{
  variables?: Record<string, string | number>;
  language?: string;
  fallback?: string;
}>('I18nTranslationOptions', {
  variables: {
    type: 'object',
    optional: true,
    validate: (v: unknown): boolean =>
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.values(v as Record<string, unknown>).every(
        (val) => typeof val === 'string' || typeof val === 'number',
      ),
  },
  language: {
    type: 'string',
    optional: true,
    validate: (v: unknown): boolean =>
      typeof v === 'string' && v.trim().length > 0,
  },
  fallback: {
    type: 'string',
    optional: true,
  },
});

/**
 * Safely parses a plain object against the BrandedTranslationOptions definition.
 *
 * Returns a discriminated union result:
 * - `{ success: true, value: BrandedInstance<TranslationOptions> }` on success
 * - `{ success: false, error: { message, code, ... } }` on failure
 *
 * @param value - The value to validate
 * @returns A safe parse result
 */
export function safeParseTranslationOptions(
  value: unknown,
): InterfaceSafeParseResult<
  BrandedInstance<{
    variables?: Record<string, string | number>;
    language?: string;
    fallback?: string;
  }>
> {
  return safeParseInterface(value, BrandedTranslationOptions);
}
